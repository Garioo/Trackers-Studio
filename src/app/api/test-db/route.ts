import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Test database connection
    await connectDB();
    console.log('MongoDB connected successfully');

    // Test User model
    console.log('Testing User model...');
    const userCount = await User.countDocuments();
    console.log('Current user count:', userCount);

    return NextResponse.json({
      status: 'success',
      message: 'Database connection and User model are working',
      userCount
    });
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 