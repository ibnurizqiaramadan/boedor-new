'use client';

import MenuItemCard from './MenuItemCard';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface MenuListProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function MenuList({
  items,
  onEdit,
  onDelete,
  isLoading = false
}: MenuListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Tidak ada item menu ditemukan. Tambahkan item menu pertama Anda!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <MenuItemCard
          key={item._id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}