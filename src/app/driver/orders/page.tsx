"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Truck, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";

export default function DriverOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  // Redirect to home page if user is not logged in
  useEffect(() => {
    if (user === null) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  if (user.role !== "driver") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Access denied. Driver only.</p>
        </div>
      </Layout>
    );
  }

  // Queries
  const allOrders = useQuery(api.boedor.orders.getAllOrders, { currentUserId: user._id });
  const myOrders = useQuery(api.boedor.orders.getOrdersByDriver, { 
    driverId: user._id, 
    currentUserId: user._id 
  });

  // Mutations
  const createOrder = useMutation(api.boedor.orders.createOrder);
  const updateOrderStatus = useMutation(api.boedor.orders.updateOrderStatus);

  // Handlers
  const handleCreateOrder = async () => {
    try {
      await createOrder({
        driverId: user._id,
        currentUserId: user._id,
      });
      toast.success("Order created successfully!");
      setIsCreateOrderOpen(false);
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error("Failed to create order: " + (error as Error).message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: "open" | "closed" | "completed") => {
    try {
      await updateOrderStatus({
        orderId: orderId as any,
        status,
        currentUserId: user._id,
      });
      toast.success(`Order status updated to ${status}!`);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status: " + (error as Error).message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "closed":
        return <XCircle className="h-4 w-4 text-orange-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-blue-600 bg-blue-100";
      case "closed":
        return "text-orange-600 bg-orange-100";
      case "completed":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Orders</h1>
          <p className="mt-2 text-gray-600">Manage your delivery orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Orders</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myOrders?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myOrders?.filter(order => order.status === "open").length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myOrders?.filter(order => order.status === "completed").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Orders Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>Manage your delivery orders</CardDescription>
              </div>
              <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                    <DialogDescription>
                      Create a new delivery order assigned to you
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-gray-600">
                      This will create a new order assigned to you as the driver.
                      The order will start with "open" status.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOrderOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateOrder}>Create Order</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOrders && myOrders.length > 0 ? (
                myOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-medium">Order #{order._id.slice(-8)}</p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/driver/orders/${order._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                        {order.status === "open" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateOrderStatus(order._id, "closed")}
                          >
                            Close
                          </Button>
                        )}
                        {order.status === "closed" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateOrderStatus(order._id, "open")}
                            >
                              Reopen
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order._id, "completed")}
                            >
                              Complete
                            </Button>
                          </>
                        )}
                        {order.status === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateOrderStatus(order._id, "open")}
                          >
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet. Create your first order!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
