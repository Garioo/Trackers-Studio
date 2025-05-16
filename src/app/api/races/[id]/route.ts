import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Race from '@/models/Race';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const deleted = await Race.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Race not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Race deleted successfully' });
  } catch (error) {
    console.error('Error deleting race:', error);
    return NextResponse.json({ error: 'Failed to delete race', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 