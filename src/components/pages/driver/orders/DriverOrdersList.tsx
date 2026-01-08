import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Plus, Truck, Eye, Share2 } from 'lucide-react';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';

interface Order {
  _id: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: number;
}

interface DriverOrdersListProps {
  orders: Order[];
  totalOrders?: number;
  onCreateOrder: () => void;
  onUpdateStatus: (orderId: string, status: 'open' | 'closed' | 'completed') => void;
  onShareOrder: (orderId: string) => void;
  onViewDetail: (orderId: string) => void;
}

export function DriverOrdersList({
  orders,
  totalOrders = 0,
  onCreateOrder,
  onUpdateStatus,
  onShareOrder,
  onViewDetail,
}: DriverOrdersListProps) {

  const OrderActions = ({ order }: { order: Order }) => (
    <div className="flex flex-wrap gap-2 justify-end">
      <Button size="sm" variant="outline" onClick={() => onViewDetail(order._id)}>
        <Eye className="h-4 w-4 mr-1" />
        Detail
      </Button>
      {order.status === 'open' && (
        <Button size="sm" variant="outline" onClick={() => onShareOrder(order._id)}>
          <Share2 className="h-4 w-4 mr-1" />
          Bagikan
        </Button>
      )}
      {order.status === 'open' && (
        <Button size="sm" variant="outline" onClick={() => onUpdateStatus(order._id, 'closed')}>
          Tutup
        </Button>
      )}
      {order.status === 'closed' && (
        <>
          <Button size="sm" variant="outline" onClick={() => onUpdateStatus(order._id, 'open')}>
            Buka Kembali
          </Button>
          <Button size="sm" onClick={() => onUpdateStatus(order._id, 'completed')}>
            Selesaikan
          </Button>
        </>
      )}
      {order.status === 'completed' && (
        <Button size="sm" variant="outline" onClick={() => onUpdateStatus(order._id, 'open')}>
          Buka Kembali
        </Button>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Pesanan Saya</CardTitle>
            <CardDescription>
              Kelola pesanan antar Anda
              {totalOrders > 0 && (
                <span className="block text-sm text-gray-600 mt-1">
                  Menampilkan {orders.length} dari {totalOrders} pesanan
                </span>
              )}
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={onCreateOrder}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Pesanan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Pesanan Baru</DialogTitle>
                <DialogDescription>
                  Buat pesanan antar baru yang ditugaskan kepada Anda
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-gray-600">
                  Ini akan membuat pesanan baru yang ditugaskan kepada Anda sebagai driver.
                  Pesanan akan dimulai dengan status "terbuka".
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>Batal</Button>
                <Button onClick={onCreateOrder}>Buat Pesanan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile: stacked list without boxes */}
        <div className="md:hidden">
          {orders.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order._id} className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <div className="font-medium">#{order._id.slice(-8)}</div>
                        <div className="text-xs text-gray-500">
                          Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <OrderActions order={order} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada pesanan. Buat pesanan pertama Anda!</p>
            </div>
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block">
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Pesanan</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Dibuat</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(order.status)}
                          <div>
                            <div className="font-medium">#{order._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <OrderActions order={order} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada pesanan. Buat pesanan pertama Anda!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}