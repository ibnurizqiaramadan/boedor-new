'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import React, { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { MenuHeader, MenuSearch, MenuGrid } from './index';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

const ITEMS_PER_PAGE = 9; // 3x3 grid

export default function UserMenuPage() {
  const { user } = useAuth();
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user?._id ? { currentUserId: user._id } : 'skip');
  const addMenuItem = useMutation(api.boedor.menu.createMenuItem);

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState<{ name: string; price: number }>({ name: '', price: 0 });
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter menu items based on search term
  const filteredMenuItems = menuItems?.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  ) || [];

  // Pagination calculations
  const totalItems = filteredMenuItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filteredMenuItems.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Reset to first page when items change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredMenuItems.length]);

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
            onSearchChange={handleSearchChange}
          />

          <CardContent>
            <MenuGrid
              items={paginatedItems}
              searchTerm={searchTerm}
              isLoading={!menuItems}
              totalItems={totalItems}
            />

            {/* Pagination */}
            {totalItems > 0 && (
              <div className="mt-6 space-y-4">
                <PaginationInfo
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}