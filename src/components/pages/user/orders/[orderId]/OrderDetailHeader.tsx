import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface OrderDetailHeaderProps {
  orderId: string;
  onBack: () => void;
  onTrack: () => void;
}

export function OrderDetailHeader({ orderId, onBack, onTrack }: OrderDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Detail Pesanan</h1>
          <p className="text-sm sm:text-base text-gray-600 break-all sm:break-normal">Pesanan #{orderId.slice(-8)}</p>
        </div>
      </div>
      <div className="flex sm:ml-auto">
        <Button className="w-full sm:w-auto" onClick={onTrack}>
          Lacak
        </Button>
      </div>
    </div>
  );
}