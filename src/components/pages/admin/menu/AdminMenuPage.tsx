'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MenuHeader, MenuList, EditMenuDialog } from './index';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

export default function AdminMenuPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Menu states
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [editErrors, setEditErrors] = useState<{ name?: string; price?: string }>({});

  // Queries
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user ? { currentUserId: user._id } : 'skip');

  // Menu mutations
  const createMenuItem = useMutation(api.boedor.menu.createMenuItem);
  const updateMenuItem = useMutation(api.boedor.menu.updateMenuItem);
  const deleteMenuItem = useMutation(api.boedor.menu.deleteMenuItem);
  const bulkImportMenuItems = useMutation(api.boedor.menu.bulkImportMenuItems);
  const deleteAllMenuItems = useMutation(api.boedor.menu.deleteAllMenuItems);

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

  // Menu handlers
  const handleAddMenuItem = async (item: { name: string; price: number }) => {
    await createMenuItem({
      name: item.name,
      price: item.price,
      currentUserId: user!._id,
    });
    toast.success('Item menu berhasil ditambahkan!');
  };

  const handleUpdateMenuItem = async (item: MenuItem) => {
    if (!selectedMenuItem) return;

    setEditErrors({});
    try {
      // Simple validation
      if (!item.name.trim()) {
        setEditErrors({ name: 'Nama item wajib diisi' });
        return;
      }
      if (item.price <= 0) {
        setEditErrors({ price: 'Harga harus lebih dari 0' });
        return;
      }

      await updateMenuItem({
        menuId: selectedMenuItem._id as any,
        name: item.name,
        price: item.price,
        currentUserId: user!._id,
      });
      toast.success('Item menu berhasil diperbarui!');
      setIsEditMenuOpen(false);
      setSelectedMenuItem(null);
    } catch (error) {
      console.error('Failed to update menu item:', error);
      toast.error('Gagal memperbarui item menu: ' + (error as Error).message);
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

  const handleImport = async (items: { name: string; price: number }[], mode: 'append' | 'replace') => {
    try {
      if (mode === 'replace') {
        await deleteAllMenuItems({ currentUserId: user!._id });
      }

      const result = await bulkImportMenuItems({
        menuItems: items,
        currentUserId: user!._id,
      });

      if (result.errors.length > 0) {
        toast.warning(`${result.success} item berhasil diimpor, ${result.errors.length} gagal`);
        console.error('Import errors:', result.errors);
      } else {
        toast.success(`${result.success} item menu berhasil diimpor`);
      }
    } catch (error) {
      throw error;
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
          <MenuHeader
            onAddMenuItem={handleAddMenuItem}
            onImport={handleImport}
            menuItems={menuItems || []}
          />
          <CardContent>
            <MenuList
              items={menuItems || []}
              onEdit={(item) => {
                setSelectedMenuItem(item);
                setIsEditMenuOpen(true);
              }}
              onDelete={handleDeleteMenuItem}
              isLoading={!menuItems}
            />
          </CardContent>
        </Card>

        {/* Edit Menu Item Dialog */}
        <EditMenuDialog
          item={selectedMenuItem}
          isOpen={isEditMenuOpen}
          onClose={() => {
            setIsEditMenuOpen(false);
            setSelectedMenuItem(null);
          }}
          onSubmit={handleUpdateMenuItem}
          errors={editErrors}
        />
      </div>
    </Layout>
  );
}