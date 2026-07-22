import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';
import type { Payment } from '@/lib/types';

interface JoinOrderActionsProps {
  selectedMenuItems: Array<{ menuId: string; qty: number }>;
  existingPayment: Payment | null;
  isSubmitting?: boolean;
  getMyCurrentTotal: () => number;
  calcSubtotal: () => number;
  onJoinOrder: () => void;
  onCancel: () => void;
}

export function JoinOrderActions({
  selectedMenuItems,
  existingPayment,
  isSubmitting = false,
  getMyCurrentTotal,
  calcSubtotal,
  onJoinOrder,
  onCancel,
}: JoinOrderActionsProps) {
  const count = selectedMenuItems.filter((i) => i.qty > 0).length;
  const subtotal = calcSubtotal();
  const overBudget = existingPayment !== null && getMyCurrentTotal() + subtotal > (existingPayment.amount ?? 0);

  return (
    <div className="sticky bottom-20 z-10 md:bottom-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border bg-card/90 p-3 shadow-lg backdrop-blur">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Subtotal ({count} item)</p>
          <p className={cn('font-semibold tabular-nums', overBudget && 'text-destructive')}>
            {formatCurrency(subtotal)}
          </p>
          {overBudget && (
            <p className="text-xs text-destructive">Melebihi sisa kembalian Anda</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>Batal</Button>
          <Button onClick={onJoinOrder} disabled={count === 0 || overBudget || isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Gabung Pesanan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
