import { IStorage, MemStorage } from './storage';
import { MongoStorage } from './storage-mongodb';

export function createStorage(): IStorage {
  // Use MongoDB only when explicitly configured
  if (process.env.USE_MONGODB === 'true' && process.env.MONGODB_URI) {
    return new MongoStorage();
  }
  
  // Default to in-memory storage for development
  return new MemStorage();
}