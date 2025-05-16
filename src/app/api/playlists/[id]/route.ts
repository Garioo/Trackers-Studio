import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Playlist from '@/models/Playlist';

// GET a single playlist
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const playlist = await Playlist.findById(params.id).populate('races.race');
    
    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch playlist', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// PATCH update a playlist
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, description } = body;

    const playlist = await Playlist.findById(params.id);
    
    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;

    await playlist.save();
    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error updating playlist:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update playlist', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE a playlist
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const playlist = await Playlist.findById(params.id);
    
    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    await playlist.deleteOne();
    return NextResponse.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete playlist', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 