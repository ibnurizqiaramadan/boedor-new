"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export default function AdminMenuPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Menu states
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [newMenuItem, setNewMenuItem] = useState({ name: "", price: 0 });

  // Queries
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user ? { currentUserId: user._id } : "skip");

  // Menu mutations
  const createMenuItem = useMutation(api.boedor.menu.createMenuItem);
  const updateMenuItem = useMutation(api.boedor.menu.updateMenuItem);
  const deleteMenuItem = useMutation(api.boedor.menu.deleteMenuItem);

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

  // Menu handlers
  const handleAddMenuItem = async () => {
    try {
      await createMenuItem({
        name: newMenuItem.name,
        price: newMenuItem.price,
        currentUserId: user!._id,
      });
      toast.success("Menu item added successfully!");
      setIsAddMenuOpen(false);
      setNewMenuItem({ name: "", price: 0 });
    } catch (error) {
      console.error("Failed to add menu item:", error);
      toast.error("Failed to add menu item: " + (error as Error).message);
    }
  };

  const handleUpdateMenuItem = async () => {
    if (selectedMenuItem) {
      try {
        await updateMenuItem({
          menuId: selectedMenuItem._id,
          name: selectedMenuItem.name,
          price: selectedMenuItem.price,
          currentUserId: user!._id,
        });
        toast.success("Menu item updated successfully!");
        setIsEditMenuOpen(false);
        setSelectedMenuItem(null);
      } catch (error) {
        console.error("Failed to update menu item:", error);
        toast.error("Failed to update menu item: " + (error as Error).message);
      }
    }
  };

  const handleDeleteMenuItem = async (menuId: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      try {
        await deleteMenuItem({ menuId: menuId as any, currentUserId: user!._id });
        toast.success("Menu item deleted successfully!");
      } catch (error) {
        console.error("Failed to delete menu item:", error);
        toast.error("Failed to delete menu item: " + (error as Error).message);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="mt-2 text-gray-600">Manage restaurant menu items</p>
        </div>

        {/* Menu Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Menu Items
                </CardTitle>
                <CardDescription>Add, edit, and manage menu items</CardDescription>
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
                      placeholder="Item Name"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddMenuOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddMenuItem}>Add Menu Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {menuItems?.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMenuItem(item);
                        setIsEditMenuOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMenuItem(item._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {menuItems?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No menu items found. Add your first menu item!
                </div>
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
