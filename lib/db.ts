import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      // Cap the pool so multiple PM2 instances don't exhaust the DB's
      // connection limit (e.g. Atlas free tier ~500).
      maxPoolSize: 10,
      // Fail fast instead of hanging the request if the DB is unreachable.
      serverSelectionTimeoutMS: 10_000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // A failed connection attempt leaves a rejected promise cached; reset it so
    // the next request can retry instead of re-awaiting the same rejection
    // forever (which would keep the app down until a process restart).
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
