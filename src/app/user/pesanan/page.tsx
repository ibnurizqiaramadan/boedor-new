"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from '../../../../convex/_generated/api';
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";

export default function UserPesananPage() {
  const { user } = useAuth();
  const availableOrders = useQuery(api.boedor.orders.getOrdersByStatus, 
    user?._id ? { status: "open", currentUserId: user._id } : "skip"
  );
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, 
    user?._id ? { currentUserId: user._id } : "skip"
  );
  const addOrderItem = useMutation(api.boedor.orderItems.addOrderItem);
  const upsertPayment = useMutation(api.boedor.payment.upsertPayment);

  const [isJoinOrderOpen, setIsJoinOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedMenuItems, setSelectedMenuItems] = useState<Array<{menuId: string, qty: number}>>([]);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "cardless" | "dana">("cash");

  const handleJoinOrder = async () => {
    if (selectedOrder && selectedMenuItems.length > 0) {
      try {
        // Add all selected items to the order
        for (const item of selectedMenuItems) {
          if (item.qty > 0) {
            await addOrderItem({
              orderId: selectedOrder._id,
              menuId: item.menuId as Id<"boedor_menu">,
              qty: item.qty,
              currentUserId: user!._id,
            });
          }
        }

        // Save payment info separately (only if amount is provided or updating existing)
        if (parseFloat(amount) > 0) {
          await upsertPayment({
            orderId: selectedOrder._id,
            paymentMethod: paymentMethod as "cash" | "cardless" | "dana",
            amount: parseFloat(amount),
            currentUserId: user!._id,
          });
        }

        toast.success("Berhasil bergabung dengan pesanan!");
        setIsJoinOrderOpen(false);
        setSelectedOrder(null);
        setSelectedMenuItems([]);
        setAmount("");
        setPaymentMethod("cash");
      } catch (error) {
        toast.error("Gagal bergabung dengan pesanan");
      }
    }
  };

  const updateMenuItemQuantity = (menuId: string, qty: number) => {
    setSelectedMenuItems(prev => {
      const existing = prev.find(item => item.menuId === menuId);
      if (existing) {
        return prev.map(item => 
          item.menuId === menuId ? { ...item, qty } : item
        );
      } else {
        return [...prev, { menuId, qty }];
      }
    });
  };

  const getMenuItemQuantity = (menuId: string) => {
    return selectedMenuItems.find(item => item.menuId === menuId)?.qty || 0;
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Memuat...</p>
        </div>
      </Layout>
    );
  }

  if (user.role !== "user") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Akses ditolak. Khusus pengguna.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pesanan Tersedia</h1>
          <p className="mt-2 text-gray-600">Bergabung dengan pesanan yang ada dari pengemudi</p>
        </div>

        {/* Available Orders */}
        <Card>
          <CardContent className="pt-8">
            <div className="space-y-4">
              {availableOrders?.filter(order => order.status === "open")
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-6)}</p>
                    <p className="text-sm text-gray-500 capitalize">Status: {order.status}</p>
                    <p className="text-sm text-gray-500">
                      Dibuat: {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedOrder(order);
                      // Reset form when opening dialog
                      setSelectedMenuItems([]);
                      setIsJoinOrderOpen(true);
                    }}
                  >
                    Gabung Pesanan
                  </Button>
                </div>
              ))}
              {(!availableOrders || availableOrders.filter(order => order.status === "open").length === 0) && (
                <p className="text-gray-500 text-center py-8">Tidak ada pesanan tersedia saat ini</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Join Order Dialog */}
        <Dialog open={isJoinOrderOpen} onOpenChange={setIsJoinOrderOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gabung Pesanan #{selectedOrder?._id.slice(-6)}</DialogTitle>
              <DialogDescription>Pilih item menu dan jumlahnya</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {menuItems?.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMenuItemQuantity(item._id, Math.max(0, getMenuItemQuantity(item._id) - 1))}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{getMenuItemQuantity(item._id)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMenuItemQuantity(item._id, getMenuItemQuantity(item._id) + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Payment Information */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-gray-900">Informasi Pembayaran</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Pembayaran
                  </label>
                  <Select value={paymentMethod} onValueChange={(value: "cash" | "cardless" | "dana") => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih metode pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="cardless">Tanpa Kartu</SelectItem>
                      <SelectItem value="dana">DANA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah
                  </label>
                  <Input
                    type="number"
                    placeholder="Masukkan jumlah"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsJoinOrderOpen(false)}>Batal</Button>
              <Button 
                onClick={handleJoinOrder}
                disabled={selectedMenuItems.filter(item => item.qty > 0).length === 0 || parseFloat(amount) <= 0}
              >
                Gabung Pesanan ({selectedMenuItems.filter(item => item.qty > 0).length} item)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
