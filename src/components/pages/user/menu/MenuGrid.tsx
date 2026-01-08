'use client';

import MenuItemCard from './MenuItemCard';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface MenuGridProps {
  items: MenuItem[];
  searchTerm: string;
  isLoading?: boolean;
  totalItems?: number;
}

export default function MenuGrid({ items, searchTerm, isLoading = false, totalItems = 0 }: MenuGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="col-span-full text-center py-8 text-gray-500">
        {searchTerm ? 'Tidak ada menu yang ditemukan' : totalItems === 0 ? 'Belum ada menu tersedia' : 'Tidak ada item di halaman ini'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <MenuItemCard key={item._id} item={item} />
      ))}
    </div>
  );
}