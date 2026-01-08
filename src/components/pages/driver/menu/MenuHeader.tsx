import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MenuHeaderProps {
  onAddMenuClick: () => void;
}

export function MenuHeader({ onAddMenuClick }: MenuHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Item Menu</h1>
        <p className="mt-2 text-gray-600">Tambahkan item menu baru ke sistem</p>
      </div>
      <Button onClick={onAddMenuClick}>
        <Plus className="h-4 w-4 mr-2" />
        Tambah Item Menu
      </Button>
    </div>
  );
}