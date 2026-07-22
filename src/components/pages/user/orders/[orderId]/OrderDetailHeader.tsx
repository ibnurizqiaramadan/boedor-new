import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';

interface OrderDetailHeaderProps {
  orderId: string;
  onBack: () => void;
  onTrack: () => void;
}

export function OrderDetailHeader({ orderId, onBack, onTrack }: OrderDetailHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={onBack}
        aria-label="Kembali"
        className="shrink-0"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl text-foreground sm:text-3xl">Detail Pesanan</h1>
        <p className="text-sm text-muted-foreground">#{orderId.slice(-8)}</p>
      </div>
      <Button onClick={onTrack} className="shrink-0">
        <MapPin className="mr-2 h-4 w-4" aria-hidden />
        Lacak
      </Button>
    </div>
  );
}
