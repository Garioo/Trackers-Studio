import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Race from '@/models/Race';

// Helper function to add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  try {
    console.log('Starting GET /api/races request...');
    console.log('Connecting to database...');
    
    const db = await connectDB();
    console.log('Database connected successfully');
    
    console.log('Fetching races from collection...');
    const races = await Race.find({}).sort({ createdAt: -1 });
    console.log(`Found ${races.length} races:`, JSON.stringify(races, null, 2));
    
    return addCorsHeaders(NextResponse.json(races));
  } catch (error) {
    console.error('Error in GET /api/races:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to fetch races', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    ));
  }
}

export async function POST(request: Request) {
  try {
    console.log('Connecting to database...');
    await connectDB();

    const body = await request.json();
    console.log('Creating new race:', body);

    const race = await Race.create(body);
    console.log('Race created successfully:', race._id);

    return addCorsHeaders(NextResponse.json(race, { status: 201 }));
  } catch (error) {
    console.error('Error in POST /api/races:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to create race', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    ));
  }
} 