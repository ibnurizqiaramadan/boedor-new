"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

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
          <p className="text-red-500">Access denied. Admin only.</p>
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
      toast.success(`Order status updated to ${status}!`);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status: " + (error as Error).message);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder({ orderId: orderId as any, currentUserId: user!._id });
        toast.success("Order deleted successfully!");
      } catch (error) {
        console.error("Failed to delete order:", error);
        toast.error("Failed to delete order: " + (error as Error).message);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><Clock className="h-3 w-3 mr-1" />Open</span>;
      case "closed":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Closed</span>;
      case "completed":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="mt-2 text-gray-600">Monitor and manage all orders</p>
        </div>

        {/* Orders Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  All Orders
                </CardTitle>
                <CardDescription>View and manage order status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders?.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">Order #{order._id.slice(-6)}</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Driver ID: {order.driverId.slice(-6)} • Created: {new Date(order._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {order.status === "open" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id, "closed")}
                      >
                        Close Order
                      </Button>
                    )}
                    {order.status === "closed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id, "completed")}
                      >
                        Complete Order
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {orders?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No orders found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
