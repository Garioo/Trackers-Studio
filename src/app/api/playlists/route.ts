import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Playlist from '@/models/Playlist';
import Race from '@/models/Race';
import mongoose from 'mongoose';

// Ensure models are registered
if (!mongoose.models.Race) {
  require('@/models/Race');
}

// GET all playlists
export async function GET() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Fetching playlists...');
    const playlists = await Playlist.find({})
      .populate({
        path: 'races.race',
        model: 'Race'
      })
      .populate({
        path: 'user',
        model: 'User',
        select: 'username',
        options: { strictPopulate: false }
      });
    return NextResponse.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch playlists', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST a new playlist
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, description, user } = body;

    if (!name) {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });
    }

    const newPlaylist = new Playlist({
      name,
      description: description || '',
      user: user || null,
      races: [] 
    });

    await newPlaylist.save();
    
    // Populate the user field before sending the response
    if (user) {
      await newPlaylist.populate({
        path: 'user',
        model: 'User',
        select: 'username',
        options: { strictPopulate: false }
      });
    }
    
    return NextResponse.json(newPlaylist, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { 
        error: 'Failed to create playlist', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 