import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Playlist from '@/models/Playlist';
import Race from '@/models/Race';
import mongoose from 'mongoose';

interface PlaylistRace {
  race: mongoose.Types.ObjectId;
  score: number;
  stats: {
    bestTime: string;
    attempts: number;
  };
}

// POST add a race to a playlist
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const { raceId } = body;

    if (!raceId) {
      return NextResponse.json(
        { error: 'Race ID is required' },
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

    const race = await Race.findById(raceId);
    if (!race) {
      return NextResponse.json(
        { error: 'Race not found' },
        { status: 404 }
      );
    }

    // Check if race is already in playlist
    const raceExists = playlist.races.some(
      (r: PlaylistRace) => r.race.toString() === raceId
    );

    if (raceExists) {
      return NextResponse.json(
        { error: 'Race is already in playlist' },
        { status: 400 }
      );
    }

    // Add race to playlist
    playlist.races.push({
      race: raceId,
      score: 0,
      stats: {
        bestTime: '',
        attempts: 0
      }
    });

    await playlist.save();
    const updatedPlaylist = await Playlist.findById(params.id).populate('races.race');
    return NextResponse.json(updatedPlaylist);
  } catch (error) {
    console.error('Error adding race to playlist:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add race to playlist', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Update score/stats for a race in the playlist
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const { raceId, score, stats } = await request.json();
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }
    const raceEntry = playlist.races.find((r: any) => r.race.toString() === raceId);
    if (!raceEntry) {
      return NextResponse.json({ error: 'Race not found in playlist' }, { status: 404 });
    }
    if (score !== undefined) raceEntry.score = score;
    if (stats !== undefined) raceEntry.stats = { ...raceEntry.stats, ...stats };
    await playlist.save();
    return NextResponse.json({ message: 'Race updated in playlist', playlist });
  } catch (error) {
    console.error('Error updating race in playlist:', error);
    return NextResponse.json({ error: 'Failed to update race', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// Remove a race from the playlist
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const { raceId } = await request.json();
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }
    playlist.races = playlist.races.filter((r: any) => r.race.toString() !== raceId);
    await playlist.save();
    return NextResponse.json({ message: 'Race removed from playlist', playlist });
  } catch (error) {
    console.error('Error removing race from playlist:', error);
    return NextResponse.json({ error: 'Failed to remove race', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 