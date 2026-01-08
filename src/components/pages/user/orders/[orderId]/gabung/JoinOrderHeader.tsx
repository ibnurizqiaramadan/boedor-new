import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface JoinOrderHeaderProps {
  orderId: string;
  onBack: () => void;
}

export function JoinOrderHeader({ orderId, onBack }: JoinOrderHeaderProps) {
  return (
    <div className="flex items-start gap-3 sm:items-center">
      <Button variant="outline" size="sm" onClick={onBack} className="shrink-0">
        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
      </Button>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Gabung Pesanan</h1>
        <p className="text-sm sm:text-base text-gray-600 break-all">Pesanan #{orderId.slice(-8)}</p>
      </div>
    </div>
  );
}