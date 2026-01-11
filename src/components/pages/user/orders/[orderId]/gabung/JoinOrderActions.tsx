import { Button } from '@/components/ui/button';
import type { Payment } from '@/lib/types';

interface JoinOrderActionsProps {
  selectedMenuItems: Array<{ menuId: string; qty: number }>;
  existingPayment: Payment | null;
  getMyCurrentTotal: () => number;
  calcSubtotal: () => number;
  onJoinOrder: () => void;
  onCancel: () => void;
}

export function JoinOrderActions({
  selectedMenuItems,
  existingPayment,
  getMyCurrentTotal,
  calcSubtotal,
  onJoinOrder,
  onCancel,
}: JoinOrderActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-6">
      <Button variant="outline" onClick={onCancel}>Batal</Button>
      <Button
        onClick={onJoinOrder}
        disabled={(() => {
          const count = selectedMenuItems.filter((i) => i.qty > 0).length;
          if (count === 0) return true;
          if (!existingPayment) return false;
          const newSubtotal = calcSubtotal();
          return getMyCurrentTotal() + newSubtotal > (existingPayment?.amount ?? 0);
        })()}
      >
        Gabung Pesanan ({selectedMenuItems.filter((i) => i.qty > 0).length} item)
      </Button>
    </div>
  );
}