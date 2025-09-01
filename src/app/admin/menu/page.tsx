'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function AdminMenuPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Menu states
  const [ isAddMenuOpen, setIsAddMenuOpen ] = useState(false);
  const [ isEditMenuOpen, setIsEditMenuOpen ] = useState(false);
  const [ selectedMenuItem, setSelectedMenuItem ] = useState<any>(null);
  const [ newMenuItem, setNewMenuItem ] = useState({ name: '', price: 0 });
  const [ addErrors, setAddErrors ] = useState<{ name?: string; price?: string }>({});
  const [ editErrors, setEditErrors ] = useState<{ name?: string; price?: string }>({});

  // Queries
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user ? { currentUserId: user._id } : 'skip');

  // Menu mutations
  const createMenuItem = useMutation(api.boedor.menu.createMenuItem);
  const updateMenuItem = useMutation(api.boedor.menu.updateMenuItem);
  const deleteMenuItem = useMutation(api.boedor.menu.deleteMenuItem);

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

  // Menu handlers
  const menuSchema = z.object({
    name: z.string().trim().min(1, 'Nama item wajib diisi'),
    price: z.number().positive('Harga harus lebih dari 0'),
  });

  const handleAddMenuItem = async () => {
    setAddErrors({});
    try {
      const parsed = menuSchema.safeParse(newMenuItem);
      if (!parsed.success) {
        const next: typeof addErrors = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof typeof next;
          next[key] = issue.message;
        }
        setAddErrors(next);
        toast.error('Periksa input Anda');
        return;
      }
      await createMenuItem({
        name: newMenuItem.name,
        price: newMenuItem.price,
        currentUserId: user!._id,
      });
      toast.success('Item menu berhasil ditambahkan!');
      setIsAddMenuOpen(false);
      setNewMenuItem({ name: '', price: 0 });
    } catch (error) {
      console.error('Failed to add menu item:', error);
      toast.error('Gagal menambah item menu: ' + (error as Error).message);
    }
  };

  const handleUpdateMenuItem = async () => {
    if (selectedMenuItem) {
      try {
        setEditErrors({});
        const parsed = menuSchema.safeParse({ name: selectedMenuItem.name, price: selectedMenuItem.price });
        if (!parsed.success) {
          const next: typeof editErrors = {};
          for (const issue of parsed.error.issues) {
            const key = issue.path[0] as keyof typeof next;
            next[key] = issue.message;
          }
          setEditErrors(next);
          toast.error('Periksa input Anda');
          return;
        }
        await updateMenuItem({
          menuId: selectedMenuItem._id,
          name: selectedMenuItem.name,
          price: selectedMenuItem.price,
          currentUserId: user!._id,
        });
        toast.success('Item menu berhasil diperbarui!');
        setIsEditMenuOpen(false);
        setSelectedMenuItem(null);
      } catch (error) {
        console.error('Failed to update menu item:', error);
        toast.error('Gagal memperbarui item menu: ' + (error as Error).message);
      }
    }
  };

  const handleDeleteMenuItem = async (menuId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus item menu ini?')) {
      try {
        await deleteMenuItem({ menuId: menuId as any, currentUserId: user!._id });
        toast.success('Item menu berhasil dihapus!');
      } catch (error) {
        console.error('Failed to delete menu item:', error);
        toast.error('Gagal menghapus item menu: ' + (error as Error).message);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Menu</h1>
          <p className="mt-2 text-gray-600">Kelola item menu restoran</p>
        </div>

        {/* Menu Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Item Menu
                </CardTitle>
                <CardDescription>Tambah, edit, dan kelola item menu</CardDescription>
              </div>
              <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Item Menu
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Item Menu</DialogTitle>
                    <DialogDescription>Buat item menu baru</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Nama Item"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                    />
                    {addErrors.name && <div className="text-xs text-red-600">{addErrors.name}</div>}
                    <Input
                      type="number"
                      placeholder="Harga"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, price: parseFloat(e.target.value) || 0 })}
                    />
                    {addErrors.price && <div className="text-xs text-red-600">{addErrors.price}</div>}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddMenuOpen(false)}>Batal</Button>
                    <Button onClick={handleAddMenuItem}>Tambah Item Menu</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {menuItems?.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMenuItem(item);
                        setIsEditMenuOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMenuItem(item._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {menuItems?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada item menu ditemukan. Tambahkan item menu pertama Anda!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Menu Item Dialog */}
        <Dialog open={isEditMenuOpen} onOpenChange={setIsEditMenuOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Item Menu</DialogTitle>
              <DialogDescription>Perbarui informasi item menu</DialogDescription>
            </DialogHeader>
            {selectedMenuItem && (
              <div className="space-y-4">
                <Input
                  placeholder="Nama Item"
                  value={selectedMenuItem.name}
                  onChange={(e) => setSelectedMenuItem({ ...selectedMenuItem, name: e.target.value })}
                />
                {editErrors.name && <div className="text-xs text-red-600">{editErrors.name}</div>}
                <Input
                  type="number"
                  placeholder="Harga"
                  value={selectedMenuItem.price}
                  onChange={(e) => setSelectedMenuItem({ ...selectedMenuItem, price: parseFloat(e.target.value) || 0 })}
                />
                {editErrors.price && <div className="text-xs text-red-600">{editErrors.price}</div>}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditMenuOpen(false)}>Batal</Button>
              <Button onClick={handleUpdateMenuItem}>Perbarui Item Menu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
