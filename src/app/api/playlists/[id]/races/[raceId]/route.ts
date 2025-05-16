import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Playlist from '@/models/Playlist';
import mongoose from 'mongoose';

interface PlaylistRace {
  race: mongoose.Types.ObjectId;
  score: number;
  stats: {
    bestTime: string;
    attempts: number;
  };
}

// PATCH update a race's score in a playlist
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; raceId: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const { score } = body;

    if (typeof score !== 'number') {
      return NextResponse.json(
        { error: 'Score must be a number' },
        { status: 400 }
      );
    }

    const playlist = await Playlist.findById(params.id);
    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    const raceIndex = playlist.races.findIndex(
      (r: PlaylistRace) => r.race.toString() === params.raceId
    );

    if (raceIndex === -1) {
      return NextResponse.json(
        { error: 'Race not found in playlist' },
        { status: 404 }
      );
    }

    playlist.races[raceIndex].score = score;
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(params.id).populate('races.race');
    return NextResponse.json(updatedPlaylist);
  } catch (error) {
    console.error('Error updating race score:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update race score', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE remove a race from a playlist
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; raceId: string } }
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

    const raceIndex = playlist.races.findIndex(
      (r: PlaylistRace) => r.race.toString() === params.raceId
    );

    if (raceIndex === -1) {
      return NextResponse.json(
        { error: 'Race not found in playlist' },
        { status: 404 }
      );
    }

    playlist.races.splice(raceIndex, 1);
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(params.id).populate('races.race');
    return NextResponse.json(updatedPlaylist);
  } catch (error) {
    console.error('Error removing race from playlist:', error);
    return NextResponse.json(
      { 
        error: 'Failed to remove race from playlist', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 