import { Wallet, CreditCard, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaymentMethodId = 'cash' | 'cardless' | 'dana';

const METHODS = [
  { id: 'cash', label: 'Tunai', icon: Wallet },
  { id: 'cardless', label: 'Tanpa Kartu', icon: CreditCard },
  { id: 'dana', label: 'DANA', icon: Smartphone },
] as const;

interface PaymentMethodPickerProps {
  value: PaymentMethodId;
  onChange: (method: PaymentMethodId) => void;
  disabled?: boolean;
  className?: string;
}

export function PaymentMethodPicker({ value, onChange, disabled = false, className }: PaymentMethodPickerProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {METHODS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => !disabled && onChange(id)}
          disabled={disabled}
          aria-pressed={value === id}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
            disabled ?
              'cursor-not-allowed bg-muted text-muted-foreground' :
              value === id ?
                'border-primary bg-primary text-primary-foreground' :
                'bg-card hover:bg-muted',
          )}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{label}</span>
        </button>
      ))}
    </div>
  );
}
