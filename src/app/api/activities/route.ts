import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';

export async function GET() {
  try {
    await connectDB();
    const activities = await Activity.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ 
      status: 'success',
      data: activities 
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to fetch activities',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const activity = await Activity.create({
      ...body,
      userId: '65f1a1b1c1d1e1f1g1h1i1j1', // Temporary user ID for testing
    });

    return NextResponse.json({ 
      status: 'success',
      data: activity 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to create activity',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 