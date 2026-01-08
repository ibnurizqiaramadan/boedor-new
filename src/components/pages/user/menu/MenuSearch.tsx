'use client';

import { Input } from '@/components/ui/input';

interface MenuSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function MenuSearch({ searchTerm, onSearchChange }: MenuSearchProps) {
  return (
    <div className="px-6 pb-4">
      <Input
        placeholder="Cari menu..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}