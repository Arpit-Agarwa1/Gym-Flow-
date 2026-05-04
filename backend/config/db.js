import mongoose from 'mongoose';

/**
 * Connects to MongoDB using MONGO_URI from environment.
 * Keeps retry logic simple so beginners see one clear error message.
 */
export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set in .env');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
