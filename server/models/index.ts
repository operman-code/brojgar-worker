import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  userType: { type: String, required: true, enum: ['worker', 'business'] },
  location: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
}, { timestamps: true });

// Worker Schema
const workerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skills: [{ type: String, required: true }],
  experienceLevel: { type: String, required: true },
  completedJobs: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }, // out of 5, stored as integer (48 = 4.8)
}, { timestamps: true });

// Business Schema
const businessSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  businessType: { type: String, required: true },
}, { timestamps: true });

// Job Schema
const jobSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  workType: { type: String, required: true },
  location: { type: String, required: true },
  duration: { type: String, required: true },
  salary: { type: String, required: true },
  workersNeeded: { type: Number, required: true },
  contactDetails: { type: String, required: true },
  isBoosted: { type: Boolean, default: false },
  boostExpiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Job Application Schema
const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'rejected'] },
}, { timestamps: true });

// Payment Schema
const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true, enum: ['job_unlock', 'job_boost', 'wallet_topup'] },
  status: { type: String, default: 'pending', enum: ['pending', 'completed', 'failed'] },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
}, { timestamps: true });

// Unlocked Job Schema
const unlockedJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
}, { timestamps: true });

// Create Models
export const User = mongoose.model('User', userSchema);
export const Worker = mongoose.model('Worker', workerSchema);
export const Business = mongoose.model('Business', businessSchema);
export const Job = mongoose.model('Job', jobSchema);
export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
export const Payment = mongoose.model('Payment', paymentSchema);
export const UnlockedJob = mongoose.model('UnlockedJob', unlockedJobSchema);

// Database connection
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/brojgar-worker';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};