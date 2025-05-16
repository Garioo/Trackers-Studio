import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

// Log environment variables (without sensitive data)
console.log('Environment check:', {
  hasMongoUri: !!process.env.MONGODB_URI,
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
  nodeEnv: process.env.NODE_ENV,
});

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  try {
    if (cached.conn) {
      console.log('Using cached database connection');
      // Log the current database name
      if (cached.conn.connection?.db) {
        console.log('Connected to database:', cached.conn.connection.db.databaseName);
      }
      return cached.conn;
    }

    if (!cached.promise) {
      console.log('Creating new database connection to:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
      
      const opts = {
        bufferCommands: false,
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts)
        .then((mongoose) => {
          console.log('Database connected successfully');
          if (mongoose.connection?.db) {
            console.log('Connected to database:', mongoose.connection.db.databaseName);
          }
          return mongoose;
        })
        .catch((error) => {
          console.error('Database connection error:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
          });
          throw error;
        });
    }

    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (error) {
      console.error('Error awaiting database connection:', error);
      cached.promise = null;
      throw error;
    }
  } catch (error) {
    console.error('Unexpected error in connectDB:', error);
    cached.promise = null;
    throw error;
  }
}

export default connectDB; 