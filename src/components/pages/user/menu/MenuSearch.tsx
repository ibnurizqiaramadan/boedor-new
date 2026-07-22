'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MenuSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function MenuSearch({ searchTerm, onSearchChange }: MenuSearchProps) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        placeholder="Cari menu..."
        aria-label="Cari menu"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
