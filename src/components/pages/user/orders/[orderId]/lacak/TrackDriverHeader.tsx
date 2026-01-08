import { Button } from '@/components/ui/button';
import { ArrowLeft, LocateFixed } from 'lucide-react';

interface TrackDriverHeaderProps {
  orderId: string;
  driverPosition: any;
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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Button variant="outline" size="sm" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Lacak Pengemudi</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 sm:ml-auto">
        {driverPosition ? (
          <span className="whitespace-nowrap">
            Terakhir diperbarui: {new Date(driverPosition.updatedAt).toLocaleTimeString('id-ID')}
          </span>
        ) : (
          <span className="whitespace-nowrap">Menunggu posisi pengemudi...</span>
        )}
        <Button
          size="sm"
          variant={followDriver ? 'default' : 'outline'}
          onClick={onToggleFollow}
          aria-pressed={followDriver}
          className="whitespace-nowrap"
          disabled={!driverPosition}
        >
          <LocateFixed className="h-4 w-4 mr-1" />
          {followDriver ? 'Terkunci' : 'Kunci ke Driver'}
        </Button>
      </div>
    </div>
  );
}