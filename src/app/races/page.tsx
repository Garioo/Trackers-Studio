'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Race {
  _id: string;
  name: string;
  type: string;
  title?: string;
  creator?: string;
  description?: string;
  rating?: number;
  players?: { min: number; max: number };
  gameMode?: string;
  routeType?: string;
  routeLength?: number;
  url?: string;
  bestTime?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Page() {
  const router = useRouter();
  const [races, setRaces] = useState<Race[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await fetch('/api/races');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch races');
        }
        const data = await response.json();
        setRaces(data);
      } catch (err) {
        console.error('Error fetching races:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRaces();
  }, []);

  const handleDelete = async (raceId: string) => {
    if (!confirm('Are you sure you want to delete this race?')) return;
    try {
      const response = await fetch(`/api/races/${raceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete race');
      }
      setRaces((prev) => prev.filter((race) => race._id !== raceId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading races...</div>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Races</h1>
        </div>

        {races.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No races found. Add your first race!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {races.map((race) => (
              <div
                key={race._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2">{race.title || race.name}</h2>
                <div className="space-y-2 text-gray-600">
                  {race.creator && (
                    <p><span className="font-medium">Creator:</span> {race.creator}</p>
                  )}
                  {race.description && (
                    <p><span className="font-medium">Description:</span> {race.description}</p>
                  )}
                  {race.rating !== undefined && (
                    <p><span className="font-medium">Rating:</span> {race.rating}%</p>
                  )}
                  {race.players && (
                    <p><span className="font-medium">Players:</span> {race.players.min} to {race.players.max}</p>
                  )}
                  {race.gameMode && (
                    <p><span className="font-medium">Game Mode:</span> {race.gameMode}</p>
                  )}
                  {race.routeType && (
                    <p><span className="font-medium">Route Type:</span> {race.routeType}</p>
                  )}
                  {race.routeLength !== undefined && (
                    <p><span className="font-medium">Route Length:</span> {race.routeLength} km</p>
                  )}
                  {race.url && (
                    <p><a href={race.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View on Social Club</a></p>
                  )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Added: {new Date(race.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(race._id)}
                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 