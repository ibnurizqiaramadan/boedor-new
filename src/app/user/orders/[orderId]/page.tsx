"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, User, ShoppingCart, Clock, CheckCircle, XCircle, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export default function UserOrderDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<any>(null);
  const [selectedMenuItems, setSelectedMenuItems] = useState<{ menuId: string; qty: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "cardless" | "dana">("cash");
  const [amount, setAmount] = useState<string>("");

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

  // Queries
  const order = useQuery(api.boedor.orders.getOrderById, { 
    orderId: orderId as Id<"boedor_orders">, 
    currentUserId: user._id 
  });
  const orderItems = useQuery(api.boedor.orderItems.getOrderItemsByOrder, { 
    orderId: orderId as Id<"boedor_orders">, 
    currentUserId: user._id 
  });
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, { currentUserId: user._id });

  // Get unique participant IDs from order items
  const participantIds = orderItems ? [...new Set(orderItems.map(item => item.userId))] : [];
  
  // Get usernames for participants
  const participants = useQuery(
    api.boedor.users.getUsernamesByIds, 
    participantIds.length > 0 ? { userIds: participantIds, currentUserId: user._id } : "skip"
  );

  // Query existing payment for this order
  const existingPayment = useQuery(
    api.boedor.payment.getPaymentByOrderUser,
    user ? {
      orderId: orderId as Id<"boedor_orders">,
      userId: user._id,
      currentUserId: user._id
    } : "skip"
  );

  // Mutations
  const updateOrderItem = useMutation(api.boedor.orderItems.updateOrderItem);
  const removeOrderItem = useMutation(api.boedor.orderItems.removeOrderItem);
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

  if (!order) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </Layout>
    );
  }

  // Group order items by user
  const itemsByUser = orderItems ? 
    orderItems.reduce((acc, item) => {
      const userId = item.userId;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(item);
      return acc;
    }, {} as Record<string, typeof orderItems>) : {};

  // Get user's own items
  const myItems = orderItems ? orderItems.filter(item => item.userId === user._id) : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "closed":
        return <XCircle className="h-5 w-5 text-orange-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  const getTotalOrderValue = () => {
    if (!orderItems || !menuItems) return 0;
    return orderItems.reduce((total, item) => {
      const menuItem = menuItems.find(m => m._id === item.menuId);
      return total + (menuItem ? menuItem.price * item.qty : 0);
    }, 0);
  };

  const getUserTotal = (userId: string) => {
    const userItems = itemsByUser[userId] || [];
    return userItems.reduce((total, item) => {
      const menuItem = menuItems?.find(m => m._id === item.menuId);
      return total + (menuItem ? menuItem.price * item.qty : 0);
    }, 0);
  };

  const getMyTotal = () => {
    return myItems.reduce((total, item) => {
      const menuItem = menuItems?.find(m => m._id === item.menuId);
      return total + (menuItem ? menuItem.price * item.qty : 0);
    }, 0);
  };

  const getMyChange = () => {
    if (!existingPayment) return 0;
    const myTotal = getMyTotal();
    return existingPayment.amount - myTotal;
  };

  const handleUpdateOrderItem = async () => {
    try {
      if (selectedOrderItem && selectedOrderItem.qty > 0) {
        await updateOrderItem({
          orderItemId: selectedOrderItem._id,
          qty: selectedOrderItem.qty,
          currentUserId: user._id,
        });
        toast.success("Order item updated successfully!");
        setIsEditItemOpen(false);
        setSelectedOrderItem(null);
      }
    } catch (error) {
      console.error("Failed to update order item:", error);
      toast.error("Failed to update order item: " + (error as Error).message);
    }
  };

  const handleRemoveOrderItem = async (orderItemId: string) => {
    try {
      if (confirm("Are you sure you want to remove this item from the order?")) {
        await removeOrderItem({
          orderItemId: orderItemId as Id<"boedor_order_items">,
          currentUserId: user._id,
        });
        toast.success("Order item removed successfully!");
      }
    } catch (error) {
      console.error("Failed to remove order item:", error);
      toast.error("Failed to remove order item: " + (error as Error).message);
    }
  };

  const handleAddMoreItems = async () => {
    try {
      if (selectedMenuItems.length > 0 && (parseFloat(amount) > 0 || existingPayment)) {
        // Add all selected items to the order
        for (const item of selectedMenuItems) {
          if (item.qty > 0) {
            await addOrderItem({
              orderId: orderId as Id<"boedor_orders">,
              menuId: item.menuId as Id<"boedor_menu">,
              qty: item.qty,
              currentUserId: user._id,
            });
          }
        }

        // Save payment info separately (only if amount is provided or updating existing)
        if (parseFloat(amount) > 0) {
          await upsertPayment({
            orderId: orderId as Id<"boedor_orders">,
            paymentMethod: paymentMethod as "cash" | "cardless" | "dana",
            amount: parseFloat(amount),
            currentUserId: user._id,
          });
        }

        toast.success("Items added to order successfully!");
        setIsAddItemOpen(false);
        setSelectedMenuItems([]);
        setAmount("");
        setPaymentMethod("cash");
      }
    } catch (error) {
      console.error("Failed to add items:", error);
      toast.error("Failed to add items: " + (error as Error).message);
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
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="mt-2 text-gray-600">Order #{orderId.slice(-8)}</p>
          </div>
        </div>

        {/* Order Info */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span>Order #{orderId.slice(-8)}</span>
                </CardTitle>
                <CardDescription>
                  Created: {new Date(order.createdAt).toLocaleString()}
                </CardDescription>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Participants</p>
                <p className="text-2xl font-bold">{participants?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">My Items</p>
                <p className="text-2xl font-bold">{myItems.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">My Total</p>
                <p className="text-2xl font-bold">{formatCurrency(getMyTotal())}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {existingPayment ? "My Change" : "Payment Status"}
                </p>
                {existingPayment ? (
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(getMyChange())}
                    </p>
                    <p className="text-xs text-gray-500">
                      Paid: {formatCurrency(existingPayment.amount)}
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-red-600">Not Paid</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Order Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>My Order Items</CardTitle>
                <CardDescription>
                  Items you've added to this order {order.status === "open" ? "(editable)" : "(read-only)"}
                </CardDescription>
              </div>
              {order.status === "open" && (
                <Button
                  onClick={() => setIsAddItemOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add More Items</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myItems.length > 0 ? (
                myItems.map((item) => {
                  const menuItem = menuItems?.find(m => m._id === item.menuId);
                  const itemTotal = menuItem ? menuItem.price * item.qty : 0;
                  
                  return (
                    <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ShoppingCart className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{menuItem?.name || 'Unknown Item'}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.qty} × {formatCurrency(menuItem?.price || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{formatCurrency(itemTotal)}</p>
                        {order.status === "open" && (
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrderItem({ ...item, qty: item.qty });
                                setIsEditItemOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveOrderItem(item._id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">You haven't added any items to this order yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Participants and Their Orders */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">All Participants & Items</h2>
          
          {participants && participants.length > 0 ? (
            participants.map((participant) => {
              if (!participant) return null;
              const userItems = itemsByUser[participant._id] || [];
              const userTotal = getUserTotal(participant._id);
              
              return (
                <Card key={participant._id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <CardTitle className="text-lg">
                            {participant.username}
                            {participant._id === user._id && " (You)"}
                          </CardTitle>
                          <CardDescription>
                            {userItems.length} item(s) • Total: {formatCurrency(userTotal)}
                          </CardDescription>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 capitalize">{participant.role}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userItems.map((item) => {
                        const menuItem = menuItems?.find(m => m._id === item.menuId);
                        const itemTotal = menuItem ? menuItem.price * item.qty : 0;
                        
                        return (
                          <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <ShoppingCart className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="font-medium">{menuItem?.name || 'Unknown Item'}</p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.qty} × {formatCurrency(menuItem?.price || 0)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(itemTotal)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No participants have joined this order yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        {orderItems && orderItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span>{orderItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Participants:</span>
                  <span>{participants?.length || 0}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Order Value:</span>
                  <span>{formatCurrency(getTotalOrderValue())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Order Item Dialog */}
        <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Order Item</DialogTitle>
              <DialogDescription>Update the quantity for this item</DialogDescription>
            </DialogHeader>
            {selectedOrderItem && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">
                    {menuItems?.find(m => m._id === selectedOrderItem.menuId)?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(menuItems?.find(m => m._id === selectedOrderItem.menuId)?.price || 0)} per item
                  </p>
                </div>
                <Input
                  type="number"
                  placeholder="Quantity"
                  min="1"
                  value={selectedOrderItem.qty}
                  onChange={(e) => setSelectedOrderItem({ 
                    ...selectedOrderItem, 
                    qty: parseInt(e.target.value) || 1 
                  })}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditItemOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateOrderItem}>Update Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add More Items Dialog */}
        <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add More Items to Order</DialogTitle>
              <DialogDescription>Select menu items and quantities to add to this order</DialogDescription>
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
              {(!menuItems || menuItems.length === 0) && (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No menu items available.</p>
                </div>
              )}
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
              <Button variant="outline" onClick={() => {
                setIsAddItemOpen(false);
                setSelectedMenuItems([]);
                setAmount("");
                setPaymentMethod("cash");
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddMoreItems}
                disabled={selectedMenuItems.filter(item => item.qty > 0).length === 0 || (!existingPayment && parseFloat(amount) <= 0)}
              >
                Add Items ({selectedMenuItems.filter(item => item.qty > 0).length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
