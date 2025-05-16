'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  _id: string;
  username: string;
  createdAt: string;
  stats: {
    totalPlaylists: number;
    totalRaces: number;
    averageScore: number;
  };
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, showInactive]);

  const fetchUsers = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.set('search', searchTerm);
      if (!showInactive) queryParams.set('activeOnly', 'true');
      
      const response = await fetch(`/api/users?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setError('Username is required');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const newUser = await response.json();
      setUsers([...users, newUser]);
      setNewUsername('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingUser._id,
          username: editingUser.username,
          isActive: editingUser.isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
      setEditingUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate user');
      }

      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: false } : user
      ));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate user');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter username"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add User
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Search Users</h2>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Show inactive users</span>
            </label>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username..."
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">All Users</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">
                No users found. Add your first user!
              </div>
            ) : (
              users.map((user) => (
                <div 
                  key={user._id} 
                  className={`px-6 py-4 hover:bg-gray-50 ${!user.isActive ? 'bg-gray-100' : ''}`}
                >
                  {editingUser?._id === user._id ? (
                    <form onSubmit={handleUpdateUser} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Username
                        </label>
                        <input
                          type="text"
                          value={editingUser.username}
                          onChange={(e) => setEditingUser({
                            ...editingUser,
                            username: e.target.value
                          })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {user.username}
                          {!user.isActive && (
                            <span className="ml-2 text-sm text-gray-500">(Inactive)</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            Playlists: {user.stats.totalPlaylists}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total Races: {user.stats.totalRaces}
                          </p>
                          <p className="text-sm text-gray-600">
                            Average Score: {user.stats.averageScore.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        {user.isActive && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 