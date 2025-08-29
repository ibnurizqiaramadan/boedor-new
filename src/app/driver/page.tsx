"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MapPin, Clock, CheckCircle, Truck, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export default function DriverPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isUpdateLocationOpen, setIsUpdateLocationOpen] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ name: "", price: 0 });
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  // Queries
  const myOrders = useQuery(api.boedor.orders.getOrdersByDriver, user ? { driverId: user._id, currentUserId: user._id } : "skip");
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user ? { currentUserId: user._id } : "skip");
  const myPosition = useQuery(api.boedor.driverPositions.getDriverPosition, user ? { driverId: user._id, currentUserId: user._id } : "skip");

  // Mutations
  const addMenuItem = useMutation(api.boedor.menu.createMenuItem);
  const updateMenuItem = useMutation(api.boedor.menu.updateMenuItem);
  const deleteMenuItem = useMutation(api.boedor.menu.deleteMenuItem);
  const updateOrderStatus = useMutation(api.boedor.orders.updateOrderStatus);
  const updatePosition = useMutation(api.boedor.driverPositions.updateDriverPosition);

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

  const handleAddMenuItem = async () => {
    try {
      if (newMenuItem.name && newMenuItem.price > 0) {
        await addMenuItem({
          name: newMenuItem.name,
          price: newMenuItem.price,
          currentUserId: user._id,
        });
        toast.success("Menu item added successfully!");
        setIsAddMenuOpen(false);
        setNewMenuItem({ name: "", price: 0 });
      }
    } catch (error) {
      console.error("Failed to add menu item:", error);
      toast.error("Failed to add menu item: " + (error as Error).message);
    }
  };

  const handleUpdateMenuItem = async () => {
    try {
      if (selectedMenuItem) {
        await updateMenuItem({
          menuId: selectedMenuItem._id,
          name: selectedMenuItem.name,
          price: selectedMenuItem.price,
          currentUserId: user._id,
        });
        toast.success("Menu item updated successfully!");
        setIsEditMenuOpen(false);
        setSelectedMenuItem(null);
      }
    } catch (error) {
      console.error("Failed to update menu item:", error);
      toast.error("Failed to update menu item: " + (error as Error).message);
    }
  };

  const handleDeleteMenuItem = async (menuId: string) => {
    try {
      if (confirm("Are you sure you want to delete this menu item?")) {
        await deleteMenuItem({ 
          menuId: menuId as any, 
          currentUserId: user._id 
        });
        toast.success("Menu item deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      toast.error("Failed to delete menu item: " + (error as Error).message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: "open" | "closed" | "completed") => {
    await updateOrderStatus({ orderId: orderId as any, status, currentUserId: user!._id });
  };

  const handleUpdateLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        await updatePosition({
          driverId: user._id,
          lat,
          lng,
          currentUserId: user._id,
        });
        setLocation({ lat, lng });
      });
    } else {
      // Manual location input
      await updatePosition({
        driverId: user._id,
        lat: location.lat,
        lng: location.lng,
        currentUserId: user._id,
      });
    }
    setIsUpdateLocationOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your orders and location</p>
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
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
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

        {/* Location Update */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Location Status</CardTitle>
                <CardDescription>Update your current location for customers</CardDescription>
              </div>
              <Dialog open={isUpdateLocationOpen} onOpenChange={setIsUpdateLocationOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <MapPin className="h-4 w-4 mr-2" />
                    Update Location
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Location</DialogTitle>
                    <DialogDescription>Update your current position</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          setLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                          });
                        });
                      }
                    }}>
                      Use Current Location
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Latitude"
                        value={location.lat}
                        onChange={(e) => setLocation({ ...location, lat: parseFloat(e.target.value) })}
                      />
                      <Input
                        type="number"
                        placeholder="Longitude"
                        value={location.lng}
                        onChange={(e) => setLocation({ ...location, lng: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUpdateLocationOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdateLocation}>Update Location</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {myPosition ? (
              <p className="text-sm text-gray-600">
                Current position: {myPosition.lat.toFixed(6)}, {myPosition.lng.toFixed(6)}
                <br />
                Last updated: {new Date(myPosition.updatedAt).toLocaleString()}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No location data available</p>
            )}
          </CardContent>
        </Card>

        {/* Order Management */}
        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
            <CardDescription>Manage your assigned delivery orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOrders?.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-6)}</p>
                    <p className="text-sm text-gray-500 capitalize">Status: {order.status}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {order.status === "open" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id, "closed")}
                      >
                        Start Delivery
                      </Button>
                    )}
                    {order.status === "closed" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id, "completed")}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {(!myOrders || myOrders.length === 0) && (
                <p className="text-gray-500 text-center py-8">No orders assigned yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Add new menu items to the system</CardDescription>
              </div>
              <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menu Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Menu Item</DialogTitle>
                    <DialogDescription>Create a new menu item</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Item name"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, price: parseFloat(e.target.value) })}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddMenuOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddMenuItem}>Add Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {menuItems?.map((item) => (
                <div key={item._id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMenuItem(item);
                        setIsEditMenuOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMenuItem(item._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!menuItems || menuItems.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No menu items yet. Add your first item!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Menu Item Dialog */}
        <Dialog open={isEditMenuOpen} onOpenChange={setIsEditMenuOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
              <DialogDescription>Update menu item information</DialogDescription>
            </DialogHeader>
            {selectedMenuItem && (
              <div className="space-y-4">
                <Input
                  placeholder="Item Name"
                  value={selectedMenuItem.name}
                  onChange={(e) => setSelectedMenuItem({ ...selectedMenuItem, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={selectedMenuItem.price}
                  onChange={(e) => setSelectedMenuItem({ ...selectedMenuItem, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditMenuOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateMenuItem}>Update Menu Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
