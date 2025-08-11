import { type User, type InsertUser, type Worker, type InsertWorker, type Business, type InsertBusiness, type Job, type InsertJob, type JobApplication, type Payment, type InsertPayment, type UnlockedJob } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWalletBalance(userId: string, amount: number): Promise<void>;

  // Worker methods
  getWorker(userId: string): Promise<Worker | undefined>;
  getWorkerByUserId(userId: string): Promise<Worker | undefined>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  getWorkerStats(workerId: string): Promise<{ completedJobs: number; rating: number; availableJobs: number }>;

  // Business methods
  getBusiness(userId: string): Promise<Business | undefined>;
  getBusinessByUserId(userId: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  getBusinessStats(businessId: string): Promise<{ activeJobs: number; applications: number; boostedJobs: number; completedJobs: number }>;

  // Job methods
  getJob(id: string): Promise<Job | undefined>;
  getJobsByBusiness(businessId: string): Promise<Job[]>;
  getJobsForWorker(location: string, skills: string[]): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined>;
  boostJob(jobId: string): Promise<void>;

  // Job applications
  getJobApplications(jobId: string): Promise<JobApplication[]>;
  createJobApplication(jobId: string, workerId: string): Promise<JobApplication>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(paymentId: string, status: string): Promise<void>;

  // Unlocked jobs
  isJobUnlocked(userId: string, jobId: string): Promise<boolean>;
  unlockJob(userId: string, jobId: string): Promise<UnlockedJob>;
  getUnlockedJobs(userId: string): Promise<UnlockedJob[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private workers: Map<string, Worker> = new Map();
  private businesses: Map<string, Business> = new Map();
  private jobs: Map<string, Job> = new Map();
  private jobApplications: Map<string, JobApplication> = new Map();
  private payments: Map<string, Payment> = new Map();
  private unlockedJobs: Map<string, UnlockedJob> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample users, workers, businesses, and jobs for demo
    const sampleUsers = [
      { id: "user1", name: "Rajesh Kumar", email: "rajesh@example.com", phone: "+91 98765 43210", password: "password", userType: "worker", location: "Mumbai Central", walletBalance: 50, createdAt: new Date() },
      { id: "user2", name: "Sharma Construction Co.", email: "sharma@example.com", phone: "+91 98765 43211", password: "password", userType: "business", location: "Mumbai Central", walletBalance: 1000, createdAt: new Date() },
    ];

    sampleUsers.forEach(user => this.users.set(user.id, user as User));

    const sampleWorker = { id: "worker1", userId: "user1", skills: ["Construction", "Delivery"], experienceLevel: "Intermediate (1-3 years)", completedJobs: 12, rating: 48 };
    this.workers.set(sampleWorker.id, sampleWorker as Worker);

    const sampleBusiness = { id: "business1", userId: "user2", businessName: "Sharma Construction Co.", businessType: "Construction" };
    this.businesses.set(sampleBusiness.id, sampleBusiness as Business);

    const sampleJobs = [
      {
        id: "job1",
        businessId: "business1",
        title: "Construction Helper Needed",
        description: "Looking for experienced construction workers for residential project. Basic tools required. Must be reliable and punctual.",
        workType: "Construction",
        location: "Mumbai Central",
        duration: "3 days",
        salary: "₹800/day",
        workersNeeded: 2,
        contactDetails: "Contact: Sharma Construction\nPhone: +91 98765 43211\nEmail: sharma@example.com",
        isBoosted: true,
        boostExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: "job2",
        businessId: "business1",
        title: "Delivery Executive Required",
        description: "Restaurant chain looking for reliable delivery executives. Own vehicle preferred. Flexible timing available.",
        workType: "Delivery",
        location: "Mumbai Central",
        duration: "Full-time",
        salary: "₹15,000/month",
        workersNeeded: 3,
        contactDetails: "Contact: Restaurant Manager\nPhone: +91 98765 43212\nEmail: delivery@restaurant.com",
        isBoosted: false,
        boostExpiresAt: null,
        isActive: true,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        id: "job3",
        businessId: "business1",
        title: "House Cleaning Service",
        description: "Family looking for reliable house cleaning service. Flexible timing available. References required.",
        workType: "Cleaning",
        location: "Mumbai Central",
        duration: "Weekly",
        salary: "₹2,000/week",
        workersNeeded: 1,
        contactDetails: "Contact: Mrs. Sharma\nPhone: +91 98765 43213\nEmail: housekeeping@family.com",
        isBoosted: false,
        boostExpiresAt: null,
        isActive: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    sampleJobs.forEach(job => this.jobs.set(job.id, job as Job));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      walletBalance: 0, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserWalletBalance(userId: string, amount: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + amount;
      this.users.set(userId, user);
    }
  }

  async getWorker(userId: string): Promise<Worker | undefined> {
    return Array.from(this.workers.values()).find(worker => worker.userId === userId);
  }

  async getWorkerByUserId(userId: string): Promise<Worker | undefined> {
    return Array.from(this.workers.values()).find(worker => worker.userId === userId);
  }

  async createWorker(insertWorker: InsertWorker): Promise<Worker> {
    const id = randomUUID();
    const worker: Worker = { 
      ...insertWorker, 
      id, 
      completedJobs: 0, 
      rating: 0 
    };
    this.workers.set(id, worker);
    return worker;
  }

  async getWorkerStats(workerId: string): Promise<{ completedJobs: number; rating: number; availableJobs: number }> {
    const worker = this.workers.get(workerId);
    const availableJobs = Array.from(this.jobs.values()).filter(job => job.isActive).length;
    return {
      completedJobs: worker?.completedJobs || 0,
      rating: worker?.rating || 0,
      availableJobs
    };
  }

  async getBusiness(userId: string): Promise<Business | undefined> {
    return Array.from(this.businesses.values()).find(business => business.userId === userId);
  }

  async getBusinessByUserId(userId: string): Promise<Business | undefined> {
    return Array.from(this.businesses.values()).find(business => business.userId === userId);
  }

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const id = randomUUID();
    const business: Business = { ...insertBusiness, id };
    this.businesses.set(id, business);
    return business;
  }

  async getBusinessStats(businessId: string): Promise<{ activeJobs: number; applications: number; boostedJobs: number; completedJobs: number }> {
    const businessJobs = Array.from(this.jobs.values()).filter(job => job.businessId === businessId);
    const activeJobs = businessJobs.filter(job => job.isActive).length;
    const boostedJobs = businessJobs.filter(job => job.isBoosted && job.isActive).length;
    const applications = Array.from(this.jobApplications.values()).filter(app => 
      businessJobs.some(job => job.id === app.jobId)
    ).length;
    
    return {
      activeJobs,
      applications,
      boostedJobs,
      completedJobs: businessJobs.filter(job => !job.isActive).length
    };
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobsByBusiness(businessId: string): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.businessId === businessId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getJobsForWorker(location: string, skills: string[]): Promise<Job[]> {
    const locationLower = location.toLowerCase();
    const skillsLower = skills.map((s) => s.toLowerCase());
    return Array.from(this.jobs.values())
      .filter((job) => {
        if (!job.isActive) return false;

        const jobLocationLower = job.location.toLowerCase();
        const locationMatches =
          jobLocationLower.includes(locationLower) ||
          locationLower.includes(jobLocationLower);

        return locationMatches;
      })
      .sort((a, b) => {
        // Prefer boosted
        if (a.isBoosted && !b.isBoosted) return -1;
        if (!a.isBoosted && b.isBoosted) return 1;
        // Prefer skill matches
        const aSkill = skillsLower.some((s) => a.workType.toLowerCase().includes(s));
        const bSkill = skillsLower.some((s) => b.workType.toLowerCase().includes(s));
        if (aSkill && !bSkill) return -1;
        if (!aSkill && bSkill) return 1;

        // Newer first
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = { 
      ...insertJob, 
      id, 
      isBoosted: false, 
      boostExpiresAt: null, 
      isActive: true, 
      createdAt: new Date() 
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (job) {
      const updatedJob = { ...job, ...updates };
      this.jobs.set(id, updatedJob);
      return updatedJob;
    }
    return undefined;
  }

  async boostJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.isBoosted = true;
      job.boostExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      this.jobs.set(jobId, job);
    }
  }

  async getJobApplications(jobId: string): Promise<JobApplication[]> {
    return Array.from(this.jobApplications.values())
      .filter(app => app.jobId === jobId)
      .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }

  async createJobApplication(jobId: string, workerId: string): Promise<JobApplication> {
    const id = randomUUID();
    const application: JobApplication = {
      id,
      jobId,
      workerId,
      status: "pending",
      appliedAt: new Date()
    };
    this.jobApplications.set(id, application);
    return application;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { 
      ...insertPayment, 
      id, 
      status: "completed", 
      createdAt: new Date() 
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
    const payment = this.payments.get(paymentId);
    if (payment) {
      payment.status = status;
      this.payments.set(paymentId, payment);
    }
  }

  async isJobUnlocked(userId: string, jobId: string): Promise<boolean> {
    return Array.from(this.unlockedJobs.values()).some(
      unlock => unlock.userId === userId && unlock.jobId === jobId
    );
  }

  async unlockJob(userId: string, jobId: string): Promise<UnlockedJob> {
    const id = randomUUID();
    const unlock: UnlockedJob = {
      id,
      userId,
      jobId,
      unlockedAt: new Date()
    };
    this.unlockedJobs.set(id, unlock);
    return unlock;
  }

  async getUnlockedJobs(userId: string): Promise<UnlockedJob[]> {
    return Array.from(this.unlockedJobs.values()).filter(unlock => unlock.userId === userId);
  }
}

export const storage = new MemStorage();
