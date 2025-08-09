import { IStorage } from './storage';
import { User, Worker, Business, Job, JobApplication, Payment, UnlockedJob } from './models';
import type { 
  User as UserType, 
  InsertUser, 
  Worker as WorkerType, 
  InsertWorker, 
  Business as BusinessType, 
  InsertBusiness, 
  Job as JobType, 
  InsertJob, 
  JobApplication as JobApplicationType, 
  Payment as PaymentType, 
  InsertPayment, 
  UnlockedJob as UnlockedJobType 
} from '@shared/schema';

export class MongoStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<UserType | undefined> {
    const user = await User.findById(id).lean();
    return user ? this.formatUser(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<UserType | undefined> {
    const user = await User.findOne({ email }).lean();
    return user ? this.formatUser(user) : undefined;
  }

  async createUser(userData: InsertUser): Promise<UserType> {
    const user = new User(userData);
    await user.save();
    return this.formatUser(user.toObject());
  }

  async updateUserWalletBalance(userId: string, amount: number): Promise<void> {
    await User.findByIdAndUpdate(userId, { $inc: { walletBalance: amount } });
  }

  // Worker methods
  async getWorker(userId: string): Promise<WorkerType | undefined> {
    const worker = await Worker.findOne({ userId }).lean();
    return worker ? this.formatWorker(worker) : undefined;
  }

  async getWorkerByUserId(userId: string): Promise<WorkerType | undefined> {
    const worker = await Worker.findOne({ userId }).lean();
    return worker ? this.formatWorker(worker) : undefined;
  }

  async createWorker(workerData: InsertWorker): Promise<WorkerType> {
    const worker = new Worker(workerData);
    await worker.save();
    return this.formatWorker(worker.toObject());
  }

  async getWorkerStats(workerId: string): Promise<{ completedJobs: number; rating: number; availableJobs: number }> {
    const worker = await Worker.findById(workerId);
    const availableJobs = await Job.countDocuments({ isActive: true });
    
    return {
      completedJobs: worker?.completedJobs || 0,
      rating: worker?.rating || 0,
      availableJobs
    };
  }

  // Business methods
  async getBusiness(userId: string): Promise<BusinessType | undefined> {
    const business = await Business.findOne({ userId }).lean();
    return business ? this.formatBusiness(business) : undefined;
  }

  async getBusinessByUserId(userId: string): Promise<BusinessType | undefined> {
    const business = await Business.findOne({ userId }).lean();
    return business ? this.formatBusiness(business) : undefined;
  }

  async createBusiness(businessData: InsertBusiness): Promise<BusinessType> {
    const business = new Business(businessData);
    await business.save();
    return this.formatBusiness(business.toObject());
  }

  async getBusinessStats(businessId: string): Promise<{ activeJobs: number; applications: number; boostedJobs: number; completedJobs: number }> {
    const activeJobs = await Job.countDocuments({ businessId, isActive: true });
    const boostedJobs = await Job.countDocuments({ businessId, isBoosted: true, isActive: true });
    const completedJobs = await Job.countDocuments({ businessId, isActive: false });
    
    const jobIds = await Job.find({ businessId }).select('_id');
    const applications = await JobApplication.countDocuments({ 
      jobId: { $in: jobIds.map(job => job._id) } 
    });

    return { activeJobs, applications, boostedJobs, completedJobs };
  }

  // Job methods
  async getJob(id: string): Promise<JobType | undefined> {
    const job = await Job.findById(id).lean();
    return job ? this.formatJob(job) : undefined;
  }

  async getJobsByBusiness(businessId: string): Promise<JobType[]> {
    const jobs = await Job.find({ businessId }).sort({ createdAt: -1 }).lean();
    return jobs.map(job => this.formatJob(job));
  }

  async getJobsForWorker(location: string, skills: string[]): Promise<JobType[]> {
    const jobs = await Job.find({
      isActive: true,
      location: { $regex: location, $options: 'i' },
      workType: { $in: skills }
    }).sort({ isBoosted: -1, createdAt: -1 }).lean();
    
    return jobs.map(job => this.formatJob(job));
  }

  async createJob(jobData: InsertJob): Promise<JobType> {
    const job = new Job(jobData);
    await job.save();
    return this.formatJob(job.toObject());
  }

  async updateJob(id: string, updates: Partial<JobType>): Promise<JobType | undefined> {
    const job = await Job.findByIdAndUpdate(id, updates, { new: true }).lean();
    return job ? this.formatJob(job) : undefined;
  }

  async boostJob(jobId: string): Promise<void> {
    await Job.findByIdAndUpdate(jobId, {
      isBoosted: true,
      boostExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
  }

  // Job applications
  async getJobApplications(jobId: string): Promise<JobApplicationType[]> {
    const applications = await JobApplication.find({ jobId }).sort({ createdAt: -1 }).lean();
    return applications.map(app => this.formatJobApplication(app));
  }

  async createJobApplication(jobId: string, workerId: string): Promise<JobApplicationType> {
    const application = new JobApplication({ jobId, workerId });
    await application.save();
    return this.formatJobApplication(application.toObject());
  }

  // Payments
  async createPayment(paymentData: InsertPayment): Promise<PaymentType> {
    const payment = new Payment({ ...paymentData, status: 'completed' });
    await payment.save();
    return this.formatPayment(payment.toObject());
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
    await Payment.findByIdAndUpdate(paymentId, { status });
  }

  // Unlocked jobs
  async isJobUnlocked(userId: string, jobId: string): Promise<boolean> {
    const unlock = await UnlockedJob.findOne({ userId, jobId });
    return !!unlock;
  }

  async unlockJob(userId: string, jobId: string): Promise<UnlockedJobType> {
    const unlock = new UnlockedJob({ userId, jobId });
    await unlock.save();
    return this.formatUnlockedJob(unlock.toObject());
  }

  async getUnlockedJobs(userId: string): Promise<UnlockedJobType[]> {
    const unlocks = await UnlockedJob.find({ userId }).lean();
    return unlocks.map(unlock => this.formatUnlockedJob(unlock));
  }

  // Helper methods to format MongoDB documents
  private formatUser(user: any): UserType {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password,
      userType: user.userType,
      location: user.location,
      walletBalance: user.walletBalance,
      createdAt: user.createdAt
    };
  }

  private formatWorker(worker: any): WorkerType {
    return {
      id: worker._id.toString(),
      userId: worker.userId.toString(),
      skills: worker.skills,
      experienceLevel: worker.experienceLevel,
      completedJobs: worker.completedJobs,
      rating: worker.rating
    };
  }

  private formatBusiness(business: any): BusinessType {
    return {
      id: business._id.toString(),
      userId: business.userId.toString(),
      businessName: business.businessName,
      businessType: business.businessType
    };
  }

  private formatJob(job: any): JobType {
    return {
      id: job._id.toString(),
      businessId: job.businessId.toString(),
      title: job.title,
      description: job.description,
      workType: job.workType,
      location: job.location,
      duration: job.duration,
      salary: job.salary,
      workersNeeded: job.workersNeeded,
      contactDetails: job.contactDetails,
      isBoosted: job.isBoosted,
      boostExpiresAt: job.boostExpiresAt,
      isActive: job.isActive,
      createdAt: job.createdAt
    };
  }

  private formatJobApplication(app: any): JobApplicationType {
    return {
      id: app._id.toString(),
      jobId: app.jobId.toString(),
      workerId: app.workerId.toString(),
      status: app.status,
      appliedAt: app.createdAt
    };
  }

  private formatPayment(payment: any): PaymentType {
    return {
      id: payment._id.toString(),
      userId: payment.userId.toString(),
      amount: payment.amount,
      type: payment.type,
      status: payment.status,
      jobId: payment.jobId?.toString() || null,
      createdAt: payment.createdAt
    };
  }

  private formatUnlockedJob(unlock: any): UnlockedJobType {
    return {
      id: unlock._id.toString(),
      userId: unlock.userId.toString(),
      jobId: unlock.jobId.toString(),
      unlockedAt: unlock.createdAt
    };
  }
}