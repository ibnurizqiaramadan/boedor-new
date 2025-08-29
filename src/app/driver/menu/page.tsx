"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

// Local type to avoid explicit any
type MenuItemLite = { _id: string; name: string; price: number };

export default function DriverMenuPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ name: "", price: 0 });
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemLite | null>(null);

  useEffect(() => {
    if (user === null) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  if (user.role !== "driver") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Akses ditolak. Khusus driver.</p>
        </div>
      </Layout>
    );
  }

  // Queries
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, { currentUserId: user._id });

  // Mutations
  const addMenuItem = useMutation(api.boedor.menu.createMenuItem);
  const updateMenuItem = useMutation(api.boedor.menu.updateMenuItem);
  const deleteMenuItem = useMutation(api.boedor.menu.deleteMenuItem);

  const handleAddMenuItem = async () => {
    try {
      if (newMenuItem.name && newMenuItem.price > 0) {
        await addMenuItem({
          name: newMenuItem.name,
          price: newMenuItem.price,
          currentUserId: user._id,
        });
        toast.success("Item menu berhasil ditambahkan!");
        setIsAddMenuOpen(false);
        setNewMenuItem({ name: "", price: 0 });
      }
    } catch (error) {
      console.error("Failed to add menu item:", error);
      toast.error("Gagal menambah item menu: " + (error as Error).message);
    }
  };

  const handleUpdateMenuItem = async () => {
    try {
      if (selectedMenuItem) {
        await updateMenuItem({
          menuId: selectedMenuItem._id as any,
          name: selectedMenuItem.name,
          price: selectedMenuItem.price,
          currentUserId: user._id,
        });
        toast.success("Item menu berhasil diperbarui!");
        setIsEditMenuOpen(false);
        setSelectedMenuItem(null);
      }
    } catch (error) {
      console.error("Failed to update menu item:", error);
      toast.error("Gagal memperbarui item menu: " + (error as Error).message);
    }
  };

  const handleDeleteMenuItem = async (menuId: string) => {
    try {
      if (confirm("Apakah Anda yakin ingin menghapus item menu ini?")) {
        await deleteMenuItem({ 
          menuId: menuId as any, 
          currentUserId: user._id 
        });
        toast.success("Item menu berhasil dihapus!");
      }
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      toast.error("Gagal menghapus item menu: " + (error as Error).message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Item Menu</h1>
            <p className="mt-2 text-gray-600">Tambahkan item menu baru ke sistem</p>
          </div>
          <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Item Menu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Item Menu</DialogTitle>
                <DialogDescription>Buat item menu baru</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nama item"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Harga"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, price: parseFloat(e.target.value) })}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMenuOpen(false)}>Batal</Button>
                <Button onClick={handleAddMenuItem}>Tambah Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Item</CardTitle>
            <CardDescription>Kelola item menu Anda</CardDescription>
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
                        setSelectedMenuItem({ _id: item._id as any, name: item.name, price: item.price });
                        setIsEditMenuOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMenuItem(item._id as any)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!menuItems || menuItems.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Belum ada item menu. Tambahkan item pertama Anda!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Menu Item Dialog */}
        <Dialog open={isEditMenuOpen} onOpenChange={setIsEditMenuOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Item Menu</DialogTitle>
              <DialogDescription>Perbarui informasi item menu</DialogDescription>
            </DialogHeader>
            {selectedMenuItem && (
              <div className="space-y-4">
                <Input
                  placeholder="Nama Item"
                  value={selectedMenuItem.name}
                  onChange={(e) => setSelectedMenuItem({ ...selectedMenuItem, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Harga"
                  value={selectedMenuItem.price}
                  onChange={(e) => setSelectedMenuItem({ ...selectedMenuItem, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditMenuOpen(false)}>Batal</Button>
              <Button onClick={handleUpdateMenuItem}>Perbarui Item Menu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
