'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';

export default function UserMenuPage() {
  const { user } = useAuth();
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user?._id ? { currentUserId: user._id } : 'skip');
  const addMenuItem = useMutation(api.boedor.menu.createMenuItem);

  const [ isAddMenuOpen, setIsAddMenuOpen ] = useState(false);
  const [ newMenuItem, setNewMenuItem ] = useState({ name: '', price: 0 });
  const [ errors, setErrors ] = useState<{ name?: string; price?: string }>({});

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const schema = z.object({
    name: z.string().trim().min(1, 'Nama item wajib diisi'),
    price: z.number().positive('Harga harus lebih dari 0'),
  });

  const handleAddMenuItem = async () => {
    try {
      setErrors({});
      const parsed = schema.safeParse(newMenuItem);
      if (!parsed.success) {
        const next: typeof errors = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof typeof next;
          next[key] = issue.message;
        }
        setErrors(next);
        toast.error('Periksa input Anda');
        return;
      }
      await addMenuItem({
        name: newMenuItem.name,
        price: newMenuItem.price,
        currentUserId: user!._id,
      });
      toast.success('Item menu berhasil diusulkan!');
      setIsAddMenuOpen(false);
      setNewMenuItem({ name: '', price: 0 });
    } catch (error) {
      console.error('Failed to suggest menu item:', error);
      toast.error('Gagal mengusulkan item menu: ' + (error as Error).message);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Memuat...</p>
        </div>
      </Layout>
    );
  }

  if (user.role !== 'user') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Akses ditolak. Khusus pengguna.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu</h1>
          <p className="mt-2 text-gray-600">Lihat semua item menu yang tersedia</p>
        </div>

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Item Menu</CardTitle>
              <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                <DialogTrigger asChild>
                  <Button>Usulkan Item</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Usulkan Item Menu Baru</DialogTitle>
                    <DialogDescription>Usulkan item menu baru untuk ditambahkan</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Nama item menu"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                    />
                    {errors.name && <div className="text-xs text-red-600">{errors.name}</div>}
                    <Input
                      type="number"
                      placeholder="Harga yang disarankan"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, price: parseFloat(e.target.value) })}
                    />
                    {errors.price && <div className="text-xs text-red-600">{errors.price}</div>}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddMenuOpen(false)}>Batal</Button>
                    <Button onClick={handleAddMenuItem}>Usulkan Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems?.map((item) => (
                <div key={item._id} className="p-4 border rounded-lg">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
