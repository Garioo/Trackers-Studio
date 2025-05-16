'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UserSelect from '@/components/UserSelect';

interface Race {
  _id: string;
  name: string;
  type: string;
  difficulty: string;
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
  user: {
    _id: string;
    username: string;
  };
  races: PlaylistRace[];
  createdAt: string;
  updatedAt: string;
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    userId: ''
  });

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/api/playlists');
        if (!response.ok) {
          throw new Error('Failed to fetch playlists');
        }
        const data = await response.json();
        setPlaylists(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylist.name || !newPlaylist.userId) {
      setError('Name and user are required');
      return;
    }

    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPlaylist.name,
          description: newPlaylist.description,
          user: newPlaylist.userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }

      const createdPlaylist = await response.json();
      setPlaylists([...playlists, createdPlaylist]);
      setIsCreating(false);
      setNewPlaylist({ name: '', description: '', userId: '' });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create playlist');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading playlists...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Playlists</h1>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isCreating ? 'Cancel' : 'Create Playlist'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {isCreating && (
          <form onSubmit={handleCreatePlaylist} className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={3}
                />
              </div>

              <UserSelect
                onSelect={(userId) => setNewPlaylist({ ...newPlaylist, userId })}
                selectedUserId={newPlaylist.userId}
              />

              <button
                type="submit"
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Create Playlist
              </button>
            </div>
          </form>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Link
              key={playlist._id}
              href={`/playlists/${playlist._id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{playlist.name}</h2>
                {playlist.description && (
                  <p className="text-gray-600 mb-4">{playlist.description}</p>
                )}
                <div className="text-sm text-gray-500">
                  <p>Created by: {playlist.user?.username || 'Anonymous'}</p>
                  <p>Races: {playlist.races.length}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 