import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Label harga item menu; item bertipe custom tidak punya harga tetap
export function menuPriceLabel(item: { price: number; priceType?: string }): string {
  return item.priceType === 'custom' ? 'Harga Custom' : formatCurrency(item.price);
}
