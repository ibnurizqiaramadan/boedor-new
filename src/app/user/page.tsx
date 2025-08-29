"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ShoppingCart, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export default function UserPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isJoinOrderOpen, setIsJoinOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedMenuItems, setSelectedMenuItems] = useState<{ menuId: string; qty: number }[]>([]);
  const [newMenuItem, setNewMenuItem] = useState({ name: "", price: 0 });
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [amount, setAmount] = useState<string>("");

  // Queries
  const availableOrders = useQuery(api.boedor.orders.getAllOrders, user ? { currentUserId: user._id } : "skip");
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user ? { currentUserId: user._id } : "skip");
  const myOrderItems = useQuery(api.boedor.orderItems.getOrderItemsByUser, user ? { userId: user._id, currentUserId: user._id } : "skip");

  // Query existing payment for selected order
  const existingPayment = useQuery(
    api.boedor.payment.getPaymentByOrderUser,
    selectedOrder && user ? {
      orderId: selectedOrder._id,
      userId: user._id,
      currentUserId: user._id
    } : "skip"
  );

  // Mutations
  const addMenuItem = useMutation(api.boedor.menu.createMenuItem);
  const addOrderItem = useMutation(api.boedor.orderItems.addOrderItem);
  const upsertPayment = useMutation(api.boedor.payment.upsertPayment);

  // Pre-populate payment form when existing payment is found
  useEffect(() => {
    if (existingPayment) {
      setPaymentMethod(existingPayment.paymentMethod);
      setAmount(existingPayment.amount.toString());
    } else {
      setPaymentMethod("cash");
      setAmount("");
    }
  }, [existingPayment]);

  // Redirect to home page if user is not logged in
  useEffect(() => {
    if (user === null) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  if (user.role !== "user") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Access denied. User only.</p>
        </div>
      </Layout>
    );
  }

  const handleAddMenuItem = async () => {
    if (newMenuItem.name && newMenuItem.price > 0) {
      await addMenuItem({
        name: newMenuItem.name,
        price: newMenuItem.price,
        currentUserId: user._id,
      });
      setIsAddMenuOpen(false);
      setNewMenuItem({ name: "", price: 0 });
    }
  };

  const handleJoinOrder = async () => {
    if (selectedOrder && selectedMenuItems.length > 0 && (parseFloat(amount) > 0 || existingPayment)) {
      try {
        // Add all selected items to the order
        for (const item of selectedMenuItems) {
          if (item.qty > 0) {
            await addOrderItem({
              orderId: selectedOrder._id,
              menuId: item.menuId as Id<"boedor_menu">,
              qty: item.qty,
              currentUserId: user._id,
            });
          }
        }

        // Save payment info separately (only if amount is provided or updating existing)
        if (parseFloat(amount) > 0) {
          await upsertPayment({
            orderId: selectedOrder._id,
            paymentMethod: paymentMethod as "cash" | "cardless" | "dana",
            amount: parseFloat(amount),
            currentUserId: user._id,
          });
        }

        toast.success("Successfully joined order!");
        setIsJoinOrderOpen(false);
        setSelectedOrder(null);
        setSelectedMenuItems([]);
        setAmount("");
        setPaymentMethod("cash");
      } catch (error) {
        toast.error("Failed to join order");
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          <p className="mt-2 text-gray-600">Browse orders and suggest menu items</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {availableOrders?.filter(order => order.status === "open").length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myOrderItems?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menuItems?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Available Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Available Orders</CardTitle>
            <CardDescription>Join existing orders from drivers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableOrders?.filter(order => order.status === "open").map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-6)}</p>
                    <p className="text-sm text-gray-500 capitalize">Status: {order.status}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(order.createdAt).toLocaleString()}
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
                    Join Order
                  </Button>
                </div>
              ))}
              {(!availableOrders || availableOrders.filter(order => order.status === "open").length === 0) && (
                <p className="text-gray-500 text-center py-8">No available orders at the moment</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>My Order Items</CardTitle>
            <CardDescription>Items you've added to orders - click to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOrderItems?.map((item) => (
                <div 
                  key={item._id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/user/orders/${item.orderId}`)}
                >
                  <div>
                    <p className="font-medium">Order #{item.orderId.slice(-6)}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
              {(!myOrderItems || myOrderItems.length === 0) && (
                <p className="text-gray-500 text-center py-8">You haven't joined any orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Suggest new menu items</CardDescription>
              </div>
              <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Suggest Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Suggest Menu Item</DialogTitle>
                    <DialogDescription>Suggest a new menu item</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Item name"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Suggested price"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, price: parseFloat(e.target.value) })}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddMenuOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddMenuItem}>Suggest Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems?.map((item) => (
                <div key={item._id} className="p-4 border rounded-lg">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Join Order Dialog */}
        <Dialog open={isJoinOrderOpen} onOpenChange={setIsJoinOrderOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Join Order #{selectedOrder?._id.slice(-6)}</DialogTitle>
              <DialogDescription>Select menu items and quantities</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {menuItems?.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
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
              <h3 className="font-medium text-gray-900">
                Payment Information {existingPayment && <span className="text-sm text-green-600">(Already set - you can update)</span>}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <Select value={paymentMethod} onValueChange={(value: "cash" | "cardless" | "dana") => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cardless">Cardless</SelectItem>
                      <SelectItem value="dana">DANA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsJoinOrderOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleJoinOrder}
                disabled={selectedMenuItems.filter(item => item.qty > 0).length === 0 || (!existingPayment && parseFloat(amount) <= 0)}
              >
                Join Order ({selectedMenuItems.filter(item => item.qty > 0).length} items)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
