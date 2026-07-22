'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MenuHeader, MenuList, AddMenuDialog, EditMenuDialog } from './index';

// Local type to avoid explicit any
type MenuItemLite = { _id: string; name: string; price: number; priceType?: 'fixed' | 'custom' };

export default function DriverMenuPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [ isAddMenuOpen, setIsAddMenuOpen ] = useState(false);
  const [ isEditMenuOpen, setIsEditMenuOpen ] = useState(false);
  const [ newMenuItem, setNewMenuItem ] = useState<{ name: string; price: number; priceType?: 'fixed' | 'custom' }>({ name: '', price: 0 });
  const [ selectedMenuItem, setSelectedMenuItem ] = useState<MenuItemLite | null>(null);

  // Filter and pagination state
  const [ menuFilter, setMenuFilter ] = useState('');
  const [ minPrice, setMinPrice ] = useState<string>('');
  const [ maxPrice, setMaxPrice ] = useState<string>('');
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ menuToDelete, setMenuToDelete ] = useState<string | null>(null);
  const [ isDeleting, setIsDeleting ] = useState(false);

  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [ user, router ]);

  // Queries (before any early return to keep hook order stable)
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user ? {} : 'skip');

  const ITEMS_PER_PAGE = 10; // Show 10 items per page for driver menu

  // Filter and paginate menu items
  const filteredMenuItems = useMemo(() => {
    if (!menuItems) return [];

    return menuItems.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(menuFilter.toLowerCase());

      // Handle price filtering
      const hasMinPrice = minPrice.trim() !== '';
      const hasMaxPrice = maxPrice.trim() !== '';

      const minPriceNum = hasMinPrice ? parseFloat(minPrice.trim()) : 0;
      const maxPriceNum = hasMaxPrice ? parseFloat(maxPrice.trim()) : Infinity;

      const minPriceMatch = !hasMinPrice || (!isNaN(minPriceNum) && item.price >= minPriceNum);
      const maxPriceMatch = !hasMaxPrice || (!isNaN(maxPriceNum) && item.price <= maxPriceNum);

      return nameMatch && minPriceMatch && maxPriceMatch;
    });
  }, [ menuItems, menuFilter, minPrice, maxPrice ]);

  // Pagination calculations
  const totalItems = filteredMenuItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filteredMenuItems.slice(startIndex, endIndex);

  // Clamp page when the list shrinks (don't yank the user to page 1 on realtime updates)
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [ currentPage, totalPages ]);

  // Mutations
  const addMenuItem = useMutation(api.boedor.menu.createMenuItem);
  const updateMenuItem = useMutation(api.boedor.menu.updateMenuItem);
  const deleteMenuItem = useMutation(api.boedor.menu.deleteMenuItem);

  if (!user) return null;

  if (user.role !== 'driver') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Akses ditolak. Khusus driver.</p>
        </div>
      </Layout>
    );
  }

  const handleAddMenuItem = async () => {
    try {
      if (newMenuItem.name && (newMenuItem.price > 0 || newMenuItem.priceType === 'custom')) {
        await addMenuItem({
          name: newMenuItem.name,
          price: newMenuItem.price,
          priceType: newMenuItem.priceType,
        });
        toast.success('Item menu berhasil ditambahkan!');
        setIsAddMenuOpen(false);
        setNewMenuItem({ name: '', price: 0 });
      }
    } catch (error) {
      console.error('Failed to add menu item:', error);
      toast.error('Gagal menambah item menu: ' + (error as Error).message);
    }
  };

  const handleUpdateMenuItem = async () => {
    try {
      if (selectedMenuItem) {
        await updateMenuItem({
          menuId: selectedMenuItem._id as any,
          name: selectedMenuItem.name,
          price: selectedMenuItem.price,
          priceType: selectedMenuItem.priceType ?? 'fixed',
        });
        toast.success('Item menu berhasil diperbarui!');
        setIsEditMenuOpen(false);
        setSelectedMenuItem(null);
      }
    } catch (error) {
      console.error('Failed to update menu item:', error);
      toast.error('Gagal memperbarui item menu: ' + (error as Error).message);
    }
  };

  const handleConfirmDeleteMenuItem = async () => {
    if (!menuToDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      await deleteMenuItem({
        menuId: menuToDelete as any,
      });
      toast.success('Item menu berhasil dihapus!');
      setMenuToDelete(null);
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      toast.error('Gagal menghapus item menu: ' + (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <MenuHeader
          onAddMenuClick={() => setIsAddMenuOpen(true)}
          menuFilter={menuFilter}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMenuFilterChange={setMenuFilter}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
        />

        <MenuList
          items={paginatedItems}
          totalItems={totalItems}
          onEdit={(item) => {
            setSelectedMenuItem({ _id: item._id as any, name: item.name, price: item.price, priceType: (item as MenuItemLite).priceType });
            setIsEditMenuOpen(true);
          }}
          onDelete={(menuId) => setMenuToDelete(menuId)}
        />

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="mt-6 flex flex-col items-center space-y-4">
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

        <AddMenuDialog
          isOpen={isAddMenuOpen}
          onClose={() => setIsAddMenuOpen(false)}
          menuItem={newMenuItem}
          onMenuItemChange={setNewMenuItem}
          onSubmit={handleAddMenuItem}
        />

        <EditMenuDialog
          isOpen={isEditMenuOpen}
          onClose={() => {
            setIsEditMenuOpen(false);
            setSelectedMenuItem(null);
          }}
          menuItem={selectedMenuItem}
          onMenuItemChange={setSelectedMenuItem}
          onSubmit={handleUpdateMenuItem}
        />

        <Dialog open={menuToDelete !== null} onOpenChange={(open) => !open && setMenuToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Item Menu?</DialogTitle>
              <DialogDescription>Item menu akan dihapus permanen.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMenuToDelete(null)} disabled={isDeleting}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleConfirmDeleteMenuItem} disabled={isDeleting}>
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}