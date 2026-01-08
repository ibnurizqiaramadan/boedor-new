'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { MenuHeader, MenuSearch, MenuGrid } from './index';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

export default function UserMenuPage() {
  const { user } = useAuth();
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user?._id ? { currentUserId: user._id } : 'skip');
  const addMenuItem = useMutation(api.boedor.menu.createMenuItem);

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState<{ name: string; price: number }>({ name: '', price: 0 });
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Filter menu items based on search term
  const filteredMenuItems = menuItems?.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  ) || [];

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
          <MenuHeader
            isDialogOpen={isAddMenuOpen}
            onDialogOpenChange={setIsAddMenuOpen}
            item={newMenuItem}
            onItemChange={setNewMenuItem}
            onSubmit={handleAddMenuItem}
            errors={errors}
          />

          <MenuSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <CardContent>
            <MenuGrid
              items={filteredMenuItems}
              searchTerm={searchTerm}
              isLoading={!menuItems}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}