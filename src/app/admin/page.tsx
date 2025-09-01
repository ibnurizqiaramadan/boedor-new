'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, Plus, Users, ShoppingBag, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ isAddUserOpen, setIsAddUserOpen ] = useState(false);
  const [ isEditUserOpen, setIsEditUserOpen ] = useState(false);
  const [ selectedUser, setSelectedUser ] = useState<any>(null);
  const [ newUser, setNewUser ] = useState({ username: '', password: '', role: 'user' as 'super_admin' | 'admin' | 'driver' | 'user' });


  // Queries
  const users = useQuery(api.boedor.users.getAllUsers, user ? { currentUserId: user._id } : 'skip');
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user ? { currentUserId: user._id } : 'skip');
  const orders = useQuery(api.boedor.orders.getAllOrders, user ? { currentUserId: user._id } : 'skip');

  // Mutations
  const deleteUser = useMutation(api.boedor.users.deleteUser);
  const updateUser = useMutation(api.boedor.users.updateUser);
  const registerUser = useAction(api.boedor.auth.register);

  // Redirect to home page if user is not logged in
  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [ user, router ]);

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

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      await deleteUser({ userId: userId as any, currentUserId: user!._id });
    }
  };

  const handleUpdateUser = async () => {
    if (selectedUser) {
      await updateUser({
        userId: selectedUser._id,
        username: selectedUser.username,
        role: selectedUser.role,
        currentUserId: user!._id,
      });
      setIsEditUserOpen(false);
      setSelectedUser(null);
    }
  };


  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dasbor Admin</h1>
          <p className="mt-2 text-gray-600">Kelola pengguna, pesanan, dan gambaran sistem</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Item Menu</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menuItems?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Kelola Pengguna</CardTitle>
                <CardDescription>Kelola semua pengguna dalam sistem</CardDescription>
              </div>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Pengguna
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                    <DialogDescription>Buat akun pengguna baru</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Nama Pengguna"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                    <Input
                      type="password"
                      placeholder="Kata Sandi"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                    <select
                      className="w-full p-2 border rounded"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'super_admin' | 'admin' | 'driver' | 'user' })}
                    >
                      <option value="user">Pengguna</option>
                      <option value="driver">Pengemudi</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Batal</Button>
                    <Button onClick={async () => {
                      try {
                        await registerUser({
                          username: newUser.username,
                          password: newUser.password,
                          role: newUser.role,
                        });
                        toast.success('Pengguna berhasil ditambahkan!');
                        setIsAddUserOpen(false);
                        setNewUser({ username: '', password: '', role: 'user' });
                      } catch (error) {
                        console.error('Failed to add user:', error);
                        toast.error('Gagal menambah pengguna: ' + (error as Error).message);
                      }
                    }}>Tambah Pengguna</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users?.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
                          try {
                            await deleteUser({ userId: user._id, currentUserId: user._id });
                            toast.success('Pengguna berhasil dihapus!');
                          } catch (error) {
                            console.error('Failed to delete user:', error);
                            toast.error('Gagal menghapus pengguna: ' + (error as Error).message);
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        {/* Edit User Dialog */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pengguna</DialogTitle>
              <DialogDescription>Perbarui informasi pengguna</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <Input
                  placeholder="Nama Pengguna"
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                />
                <select
                  className="w-full p-2 border rounded"
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                >
                  <option value="user">Pengguna</option>
                  <option value="driver">Pengemudi</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>Batal</Button>
              <Button onClick={handleUpdateUser}>Perbarui Pengguna</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}
