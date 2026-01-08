'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  role: 'super_admin' | 'admin' | 'driver' | 'user';
}

interface UserCardProps {
  user: User;
  onDelete: (userId: string) => void;
}

export default function UserCard({ user, onDelete }: UserCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <p className="font-medium">{user.username}</p>
        <p className="text-sm text-gray-500 capitalize">{user.role}</p>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(user._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}