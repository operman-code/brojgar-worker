import type { Express } from "express";
import { createServer, type Server } from "http";
import { createStorage } from "./storage-factory";

import { insertUserSchema, insertWorkerSchema, insertBusinessSchema, insertJobSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const storage = createStorage();
  
  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const user = await storage.createUser(userData);
      
      // Create worker or business profile based on user type
      if (userData.userType === "worker") {
        const workerData = insertWorkerSchema.parse({
          userId: user.id,
          skills: req.body.skills || [],
          experienceLevel: req.body.experienceLevel || "Beginner"
        });
        await storage.createWorker(workerData);
      } else if (userData.userType === "business") {
        const businessData = insertBusinessSchema.parse({
          userId: user.id,
          businessName: req.body.businessName || "",
          businessType: req.body.businessType || ""
        });
        await storage.createBusiness(businessData);
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Worker routes
  app.get("/api/worker/profile/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      const worker = await storage.getWorkerByUserId(req.params.userId);
      
      if (!user || !worker) {
        return res.status(404).json({ message: "Worker not found" });
      }

      const stats = await storage.getWorkerStats(worker.id);
      res.json({ user: { ...user, password: undefined }, worker, stats });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch worker profile", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/worker/jobs/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      const worker = await storage.getWorkerByUserId(req.params.userId);
      
      if (!user || !worker) {
        return res.status(404).json({ message: "Worker not found" });
      }

      const jobs = await storage.getJobsForWorker(user.location, worker.skills);
      
      // Add unlock status for each job
      const jobsWithUnlockStatus = await Promise.all(
        jobs.map(async (job) => {
          const isUnlocked = await storage.isJobUnlocked(req.params.userId, job.id);
          return { ...job, isUnlocked };
        })
      );

      res.json(jobsWithUnlockStatus);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Business routes
  app.get("/api/business/profile/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      const business = await storage.getBusinessByUserId(req.params.userId);
      
      if (!user || !business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const stats = await storage.getBusinessStats(business.id);
      res.json({ user: { ...user, password: undefined }, business, stats });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business profile", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/business/jobs/:userId", async (req, res) => {
    try {
      const business = await storage.getBusinessByUserId(req.params.userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const jobs = await storage.getJobsByBusiness(business.id);
      
      // Add application count for each job
      const jobsWithApplications = await Promise.all(
        jobs.map(async (job) => {
          const applications = await storage.getJobApplications(job.id);
          return { ...job, applicationsCount: applications.length };
        })
      );

      res.json(jobsWithApplications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business jobs", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Job routes
  app.post("/api/jobs", async (req, res) => {
    try {
      const business = await storage.getBusinessByUserId(req.body.userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const jobData = insertJobSchema.parse({
        ...req.body,
        businessId: business.id
      });

      const job = await storage.createJob(jobData);

      // If boost is requested, process boost payment
      if (req.body.boost) {
        await storage.boostJob(job.id);
        await storage.updateUserWalletBalance(req.body.userId, -100);
      }

      res.json(job);
    } catch (error) {
      res.status(400).json({ message: "Failed to create job", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Payment routes
  app.post("/api/payments/unlock-job", async (req, res) => {
    try {
      const { userId, jobId } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if ((user.walletBalance || 0) < 20) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      // Check if job is already unlocked
      const isUnlocked = await storage.isJobUnlocked(userId, jobId);
      if (isUnlocked) {
        return res.status(400).json({ message: "Job already unlocked" });
      }

      // Process payment
      const payment = await storage.createPayment({
        userId,
        amount: 20,
        type: "job_unlock",
        jobId
      });

      // Deduct from wallet
      await storage.updateUserWalletBalance(userId, -20);

      // Unlock job
      await storage.unlockJob(userId, jobId);

      res.json({ payment, message: "Job unlocked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Payment failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/payments/boost-job", async (req, res) => {
    try {
      const { userId, jobId } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if ((user.walletBalance || 0) < 100) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      // Process payment
      const payment = await storage.createPayment({
        userId,
        amount: 100,
        type: "job_boost",
        jobId
      });

      // Deduct from wallet
      await storage.updateUserWalletBalance(userId, -100);

      // Boost job
      await storage.boostJob(jobId);

      res.json({ payment, message: "Job boosted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Boost payment failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/payments/topup-wallet", async (req, res) => {
    try {
      const { userId, amount } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Process payment
      const payment = await storage.createPayment({
        userId,
        amount,
        type: "wallet_topup"
      });

      // Add to wallet
      await storage.updateUserWalletBalance(userId, amount);

      res.json({ payment, message: "Wallet topped up successfully" });
    } catch (error) {
      res.status(500).json({ message: "Wallet topup failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
