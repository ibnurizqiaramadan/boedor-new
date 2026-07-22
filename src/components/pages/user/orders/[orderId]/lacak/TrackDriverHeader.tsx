import { Button } from '@/components/ui/button';
import { ArrowLeft, LocateFixed } from 'lucide-react';
import type { DriverPosition } from '@/lib/types';

interface TrackDriverHeaderProps {
  orderId: string;
  driverPosition: DriverPosition | null;
  followDriver: boolean;
  onBack: () => void;
  onToggleFollow: () => void;
}

export function TrackDriverHeader({
  orderId,
  driverPosition,
  followDriver,
  onBack,
  onToggleFollow,
}: TrackDriverHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" size="icon" onClick={onBack} aria-label="Kembali" className="shrink-0">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl text-foreground sm:text-3xl">Lacak Pengemudi</h1>
        <p className="text-sm text-muted-foreground">#{orderId.slice(-8)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {driverPosition ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-400/15 px-2.5 py-1 text-xs font-medium text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            Live · {new Date(driverPosition.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-medium text-amber-400">
            Menunggu posisi...
          </span>
        )}
        <Button
          size="sm"
          variant={followDriver ? 'default' : 'outline'}
          onClick={onToggleFollow}
          aria-pressed={followDriver}
          className="whitespace-nowrap"
          disabled={!driverPosition}
        >
          <LocateFixed className="mr-1.5 h-4 w-4" aria-hidden />
          {followDriver ? 'Terkunci' : 'Ikuti Driver'}
        </Button>
      </div>
    </div>
  );
}
