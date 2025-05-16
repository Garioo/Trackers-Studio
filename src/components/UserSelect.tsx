import { useState, useEffect } from 'react';

interface User {
  _id: string;
  username: string;
}

interface UserSelectProps {
  onSelect: (userId: string) => void;
  selectedUserId?: string;
}

export default function UserSelect({ onSelect, selectedUserId }: UserSelectProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">
        Select User
      </label>
      <select
        id="user-select"
        value={selectedUserId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
      >
        <option value="">Select a user</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.username}
          </option>
        ))}
      </select>
    </div>
  );
} 