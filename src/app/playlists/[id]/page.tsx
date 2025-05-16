'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Race {
  _id: string;
  name: string;
  type: string;
  difficulty: string;
  bestTime?: string;
}

interface PlaylistRace {
  race: Race;
  score: number;
  stats: {
    bestTime: string;
    attempts: number;
  };
}

interface Playlist {
  _id: string;
  name: string;
  description: string;
  races: PlaylistRace[];
  createdAt: string;
  updatedAt: string;
}

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingRace, setIsAddingRace] = useState(false);
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [availableRaces, setAvailableRaces] = useState<Race[]>([]);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(`/api/playlists/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch playlist');
        }
        const data = await response.json();
        setPlaylist(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAvailableRaces = async () => {
      try {
        const response = await fetch('/api/races');
        if (!response.ok) {
          throw new Error('Failed to fetch races');
        }
        const data = await response.json();
        setAvailableRaces(data);
      } catch (err) {
        console.error('Error fetching races:', err);
      }
    };

    fetchPlaylist();
    fetchAvailableRaces();
  }, [resolvedParams.id]);

  const handleAddRace = async () => {
    if (!selectedRace) return;

    try {
      const response = await fetch(`/api/playlists/${resolvedParams.id}/races`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raceId: selectedRace }),
      });

      if (!response.ok) {
        throw new Error('Failed to add race');
      }

      const updatedPlaylist = await response.json();
      setPlaylist(updatedPlaylist);
      setIsAddingRace(false);
      setSelectedRace('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add race');
    }
  };

  const handleUpdateScore = async (raceId: string, score: number) => {
    try {
      const response = await fetch(`/api/playlists/${resolvedParams.id}/races/${raceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score }),
      });

      if (!response.ok) {
        throw new Error('Failed to update score');
      }

      const updatedPlaylist = await response.json();
      setPlaylist(updatedPlaylist);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update score');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading playlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Playlist not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/playlists"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Playlists
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-gray-600 mt-2">{playlist.description}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Races</h2>
            <button
              onClick={() => setIsAddingRace(!isAddingRace)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isAddingRace ? 'Cancel' : 'Add Race'}
            </button>
          </div>

          {isAddingRace && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <select
                value={selectedRace}
                onChange={(e) => setSelectedRace(e.target.value)}
                className="w-full p-2 border rounded-md mb-2"
              >
                <option value="">Select a race</option>
                {availableRaces.map((race) => (
                  <option key={race._id} value={race._id}>
                    {race.name} ({race.difficulty})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddRace}
                disabled={!selectedRace}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Add Race
              </button>
            </div>
          )}

          {playlist.races.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No races added to this playlist yet.
            </div>
          ) : (
            <div className="space-y-4">
              {playlist.races.map((playlistRace) => (
                <div
                  key={playlistRace.race._id}
                  className="border rounded-md p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{playlistRace.race.name}</h3>
                      <p className="text-sm text-gray-500">
                        {playlistRace.race.type} • {playlistRace.race.difficulty}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="text-sm text-gray-600">Score:</label>
                        <input
                          type="number"
                          min="0"
                          value={playlistRace.score}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                            if (!isNaN(value)) {
                              handleUpdateScore(
                                playlistRace.race._id,
                                value
                              );
                            }
                          }}
                          className="ml-2 w-20 p-1 border rounded"
                        />
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Best Time: {playlistRace.stats.bestTime || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Attempts: {playlistRace.stats.attempts}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 