import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Helper function to verify user role
async function requireRole(ctx: any, userId: string, allowedRoles: string[]) {
  const user = await ctx.db.get(userId);
  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Realtime query - get all menu items
export const getAllMenuItems = query({
  args: { currentUserId: v.id("boedor_users") },
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
    currentUserId: v.id("boedor_users") 
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
    currentUserId: v.id("boedor_users"),
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
    currentUserId: v.id("boedor_users"),
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
    
    const updateData: any = {};
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
    currentUserId: v.id("boedor_users"),
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
