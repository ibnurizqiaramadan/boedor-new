import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Helper function to verify user role
async function requireRole(ctx: { db: any; auth: any }, userId: string, allowedRoles: string[]) {
  const user = await ctx.db.get(userId);
  if (!user || !allowedRoles.includes(user.role || 'user')) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Realtime query - get all menu items
export const getAllMenuItems = query({
  args: { currentUserId: v.id("users") },
  handler: async (ctx, args) => {
    // All authenticated users can view menu items
    const user = await ctx.db.get(args.currentUserId);
    if (!user) throw new Error("Unauthorized");

    const items = await ctx.db.query("boedor_menu").collect();
    // Sort by name ascending (case-insensitive)
    return items.sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));
  },
});

// Get menu item by ID
export const getMenuItemById = query({
  args: { 
    menuId: v.id("boedor_menu"),
    currentUserId: v.id("users") 
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.currentUserId);
    if (!user) throw new Error("Unauthorized");
    
    return await ctx.db.get(args.menuId);
  },
});

// Create menu item (admin, driver, user can create)
export const createMenuItem = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin", "driver", "user"]);
    
    const menuId = await ctx.db.insert("boedor_menu", {
      name: args.name,
      price: args.price,
      createdBy: args.currentUserId,
    });
    
    return await ctx.db.get(menuId);
  },
});

// Update menu item (admin and creator can update)
export const updateMenuItem = mutation({
  args: {
    menuId: v.id("boedor_menu"),
    currentUserId: v.id("users"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.currentUserId);
    if (!user) throw new Error("Unauthorized");
    
    const menuItem = await ctx.db.get(args.menuId);
    if (!menuItem) throw new Error("Menu item not found");
    
    // Admin, super_admin, and drivers can update any item, users can only update their own
    if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "driver" && menuItem.createdBy !== args.currentUserId) {
      throw new Error("Unauthorized");
    }
    
    const updateData: Partial<{ name: string; price: number }> = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.price !== undefined) updateData.price = args.price;
    
    await ctx.db.patch(args.menuId, updateData);
    return await ctx.db.get(args.menuId);
  },
});

// Delete menu item (admin and creator can delete)
export const deleteMenuItem = mutation({
  args: {
    menuId: v.id("boedor_menu"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.currentUserId);
    if (!user) throw new Error("Unauthorized");
    
    const menuItem = await ctx.db.get(args.menuId);
    if (!menuItem) throw new Error("Menu item not found");
    
    // Admin, super_admin, and drivers can delete any item, users can only delete their own
    if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "driver" && menuItem.createdBy !== args.currentUserId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.delete(args.menuId);
    return { success: true };
  },
});

// Bulk import menu items (admin only)
export const bulkImportMenuItems = mutation({
  args: {
    menuItems: v.array(v.object({
      name: v.string(),
      price: v.number(),
    })),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin"]);

    const results = [];
    const errors = [];

    for (let i = 0; i < args.menuItems.length; i++) {
      const item = args.menuItems[i];
      try {
        // Validate item data
        if (!item.name || item.name.trim().length === 0) {
          errors.push({ index: i, error: "Nama item tidak boleh kosong" });
          continue;
        }
        if (item.price <= 0) {
          errors.push({ index: i, error: "Harga harus lebih dari 0" });
          continue;
        }

        const menuId = await ctx.db.insert("boedor_menu", {
          name: item.name.trim(),
          price: item.price,
          createdBy: args.currentUserId,
        });

        results.push(await ctx.db.get(menuId));
      } catch (error) {
        errors.push({ index: i, error: (error as Error).message });
      }
    }

    return { success: results.length, errors };
  },
});

// Delete all menu items (admin only) - for replace import
export const deleteAllMenuItems = mutation({
  args: {
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin"]);

    const allItems = await ctx.db.query("boedor_menu").collect();
    let deletedCount = 0;

    for (const item of allItems) {
      await ctx.db.delete(item._id);
      deletedCount++;
    }

    return { deletedCount };
  },
});
