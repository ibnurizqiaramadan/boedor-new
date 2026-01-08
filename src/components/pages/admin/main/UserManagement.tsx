'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserCard from './UserCard';
import AddUserDialog from './AddUserDialog';

interface User {
  _id: string;
  username: string;
  role: 'super_admin' | 'admin' | 'driver' | 'user';
}

interface UserManagementProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
  onAddUser: (user: { username: string; password: string; role: 'super_admin' | 'admin' | 'driver' | 'user' }) => void;
}

export default function UserManagement({ users, onDeleteUser, onAddUser }: UserManagementProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Kelola Pengguna</CardTitle>
            <CardDescription>Kelola semua pengguna dalam sistem</CardDescription>
          </div>
          <AddUserDialog onAddUser={onAddUser} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onDelete={onDeleteUser}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}