import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Testing database connection...');
    await connectDB();
    console.log('Database connection successful');
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Database connection successful',
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      }
    }, { status: 500 });
  }
} 