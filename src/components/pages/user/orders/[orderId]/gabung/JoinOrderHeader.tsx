import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface JoinOrderHeaderProps {
  orderId: string;
  onBack: () => void;
}

export function JoinOrderHeader({ orderId, onBack }: JoinOrderHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={onBack} aria-label="Kembali" className="shrink-0">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-0">
        <h1 className="font-display text-2xl text-foreground sm:text-3xl">Gabung Pesanan</h1>
        <p className="text-sm text-muted-foreground">#{orderId.slice(-8)}</p>
      </div>
    </div>
  );
}
