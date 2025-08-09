import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  userType: text("user_type").notNull(), // 'worker' or 'business'
  location: text("location").notNull(),
  walletBalance: integer("wallet_balance").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workers = pgTable("workers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  skills: jsonb("skills").$type<string[]>().notNull(),
  experienceLevel: text("experience_level").notNull(),
  completedJobs: integer("completed_jobs").default(0),
  rating: integer("rating").default(0), // out of 5, stored as integer (48 = 4.8)
});

export const businesses = pgTable("businesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  workType: text("work_type").notNull(),
  location: text("location").notNull(),
  duration: text("duration").notNull(),
  salary: text("salary").notNull(),
  workersNeeded: integer("workers_needed").notNull(),
  contactDetails: text("contact_details").notNull(),
  isBoosted: boolean("is_boosted").default(false),
  boostExpiresAt: timestamp("boost_expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  status: text("status").default("pending"), // 'pending', 'accepted', 'rejected'
  appliedAt: timestamp("applied_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'job_unlock', 'job_boost', 'wallet_topup'
  status: text("status").default("pending"), // 'pending', 'completed', 'failed'
  jobId: varchar("job_id").references(() => jobs.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const unlockedJobs = pgTable("unlocked_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  walletBalance: true,
  createdAt: true,
});

export const insertWorkerSchema = createInsertSchema(workers).omit({
  id: true,
  completedJobs: true,
  rating: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  isBoosted: true,
  boostExpiresAt: true,
  isActive: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Worker = typeof workers.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type JobApplication = typeof jobApplications.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type UnlockedJob = typeof unlockedJobs.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
