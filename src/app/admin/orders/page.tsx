"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { getStatusIcon, getStatusColor, formatStatus } from "@/lib/status";

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Queries
  const orders = useQuery(api.boedor.orders.getAllOrders, user ? { currentUserId: user._id } : "skip");

  // Mutations
  const updateOrderStatus = useMutation(api.boedor.orders.updateOrderStatus);
  const deleteOrder = useMutation(api.boedor.orders.deleteOrder);

  // Redirect to home page if user is not logged in
  useEffect(() => {
    if (user === null) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Akses ditolak. Khusus admin.</p>
        </div>
      </Layout>
    );
  }

  const handleUpdateOrderStatus = async (orderId: string, status: "open" | "closed" | "completed") => {
    try {
      await updateOrderStatus({
        orderId: orderId as any,
        status,
        currentUserId: user!._id,
      });
      toast.success(`Status pesanan diperbarui menjadi ${status}!`);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Gagal memperbarui status pesanan: " + (error as Error).message);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) {
      try {
        await deleteOrder({ orderId: orderId as any, currentUserId: user!._id });
        toast.success("Pesanan berhasil dihapus!");
      } catch (error) {
        console.error("Failed to delete order:", error);
        toast.error("Gagal menghapus pesanan: " + (error as Error).message);
      }
    }
  };

  const getStatusBadge = (status: string) => (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      <span className="shrink-0">{getStatusIcon(status)}</span>
      {formatStatus(status)}
    </span>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pesanan</h1>
          <p className="mt-2 text-gray-600">Pantau dan kelola semua pesanan</p>
        </div>

        {/* Orders Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Semua Pesanan
                </CardTitle>
                <CardDescription>Lihat dan kelola status pesanan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders?.sort((a, b) => b.createdAt - a.createdAt).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">Pesanan #{order._id.slice(-6)}</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      ID Driver: {order.driverId.slice(-6)} • Dibuat: {new Date(order._creationTime).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {order.status === "open" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id, "closed")}
                      >
                        Tutup Pesanan
                      </Button>
                    )}
                    {order.status === "closed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id, "completed")}
                      >
                        Selesaikan Pesanan
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
              {orders?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada pesanan.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
