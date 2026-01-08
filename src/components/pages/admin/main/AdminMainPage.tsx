'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { StatsCards, UserManagement } from './index';

interface User {
  _id: string;
  username: string;
  role: 'super_admin' | 'admin' | 'driver' | 'user';
}

export default function AdminMainPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Queries
  const users = useQuery(api.boedor.users.getAllUsers, user ? { currentUserId: user._id } : 'skip');
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user ? { currentUserId: user._id } : 'skip');
  const orders = useQuery(api.boedor.orders.getAllOrders, user ? { currentUserId: user._id } : 'skip');

  // Mutations
  const deleteUser = useMutation(api.boedor.users.deleteUser);
  const registerUser = useAction(api.boedor.auth.register);

  // Redirect to home page if user is not logged in
  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Akses ditolak. Khusus admin.</p>
        </div>
      </Layout>
    );
  }

  // Handlers
  const handleDeleteUser = async (userId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        await deleteUser({ userId: userId as any, currentUserId: user!._id });
        toast.success('Pengguna berhasil dihapus!');
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast.error('Gagal menghapus pengguna: ' + (error as Error).message);
      }
    }
  };

  const handleAddUser = async (newUserData: { username: string; password: string; role: 'super_admin' | 'admin' | 'driver' | 'user' }) => {
    await registerUser({
      username: newUserData.username,
      password: newUserData.password,
      role: newUserData.role,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dasbor Admin</h1>
          <p className="mt-2 text-gray-600">Kelola pengguna, pesanan, dan gambaran sistem</p>
        </div>

        {/* Stats Cards */}
        <StatsCards
          totalUsers={users?.length || 0}
          totalMenuItems={menuItems?.length || 0}
          totalOrders={orders?.length || 0}
        />

        {/* User Management */}
        <UserManagement
          users={users || []}
          onDeleteUser={handleDeleteUser}
          onAddUser={handleAddUser}
        />
      </div>
    </Layout>
  );
}