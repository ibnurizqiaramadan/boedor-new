import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';
import { formatCurrency } from '@/lib/utils';
import type { Payment } from '@/lib/types';

interface Order {
  _id: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: number;
}

interface OrderDetailStatsProps {
  order: Order;
  participantsCount: number;
  myItemsCount: number;
  myTotal: number;
  existingPayment: Payment | null;
  myChange: number;
}

export function OrderDetailStats({
  order,
  participantsCount,
  myItemsCount,
  myTotal,
  existingPayment,
  myChange,
}: OrderDetailStatsProps) {
  return (
    <>
      {/* Order Info */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span>Pesanan #{order._id.slice(-8)}</span>
              </CardTitle>
              <CardDescription>
                Dibuat: {new Date(order.createdAt).toLocaleString('id-ID')}
              </CardDescription>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {formatStatus(order.status)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Peserta</p>
              <p className="text-2xl font-bold">{participantsCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Item Saya</p>
              <p className="text-2xl font-bold">{myItemsCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Saya</p>
              <p className="text-2xl font-bold">{formatCurrency(myTotal)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {existingPayment ? 'Kembalian Saya' : 'Status Pembayaran'}
              </p>
              {existingPayment ? (
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(myChange)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Dibayar: {formatCurrency(existingPayment.amount)}
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-red-600">Belum Dibayar</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}