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

// Realtime query - get order items by order ID
export const getOrderItemsByOrder = query({
  args: { 
    orderId: v.id("boedor_orders"),
    currentUserId: v.id("boedor_users") 
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin", "driver", "user"]);
    
    return await ctx.db
      .query("boedor_order_items")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();
  },
});

// Get order items by user
export const getOrderItemsByUser = query({
  args: { 
    userId: v.id("boedor_users"),
    currentUserId: v.id("boedor_users") 
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.currentUserId);
    if (!user) throw new Error("Unauthorized");
    
    // Admin can view any user's items, users can view their own items
    if (user.role !== "admin" && args.userId !== args.currentUserId) {
      throw new Error("Unauthorized");
    }
    
    return await ctx.db
      .query("boedor_order_items")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Add item to order (users can add items to open orders)
export const addOrderItem = mutation({
  args: {
    orderId: v.id("boedor_orders"),
    menuId: v.id("boedor_menu"),
    qty: v.number(),
    note: v.optional(v.string()),
    currentUserId: v.id("boedor_users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin", "driver", "user"]);
    
    // Verify order exists and is open
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "open") throw new Error("Order is not open for new items");
    
    // Verify menu item exists
    const menuItem = await ctx.db.get(args.menuId);
    if (!menuItem) throw new Error("Menu item not found");
    
    // Check if item already exists for this user in this order
    const existingItem = await ctx.db
      .query("boedor_order_items")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .filter((q) => q.and(
        q.eq(q.field("menuId"), args.menuId),
        q.eq(q.field("userId"), args.currentUserId)
      ))
      .first();
    
    if (existingItem) {
      // Update quantity
      await ctx.db.patch(existingItem._id, { 
        qty: existingItem.qty + args.qty,
        ...(args.note !== undefined ? { note: args.note } : {}),
      });
      return await ctx.db.get(existingItem._id);
    } else {
      // Create new order item
      const orderItemId = await ctx.db.insert("boedor_order_items", {
        orderId: args.orderId,
        menuId: args.menuId,
        userId: args.currentUserId,
        qty: args.qty,
        note: args.note,
      });
      return await ctx.db.get(orderItemId);
    }
  },
});

// Update order item quantity
export const updateOrderItem = mutation({
  args: {
    orderItemId: v.id("boedor_order_items"),
    qty: v.number(),
    note: v.optional(v.string()),
    currentUserId: v.id("boedor_users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.currentUserId);
    if (!user) throw new Error("Unauthorized");
    
    const orderItem = await ctx.db.get(args.orderItemId);
    if (!orderItem) throw new Error("Order item not found");
    
    // Admin can update any item, users can only update their own items
    if (user.role !== "admin" && orderItem.userId !== args.currentUserId) {
      throw new Error("Unauthorized");
    }
    
    // Verify order is still open
    const order = await ctx.db.get(orderItem.orderId);
    if (!order || order.status !== "open") {
      throw new Error("Order is not open for modifications");
    }
    
    if (args.qty <= 0) {
      await ctx.db.delete(args.orderItemId);
      return { success: true, deleted: true };
    } else {
      await ctx.db.patch(args.orderItemId, { 
        qty: args.qty,
        ...(args.note !== undefined ? { note: args.note } : {}),
      });
      return await ctx.db.get(args.orderItemId);
    }
  },
});

// Remove order item
export const removeOrderItem = mutation({
  args: {
    orderItemId: v.id("boedor_order_items"),
    currentUserId: v.id("boedor_users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.currentUserId);
    if (!user) throw new Error("Unauthorized");
    
    const orderItem = await ctx.db.get(args.orderItemId);
    if (!orderItem) throw new Error("Order item not found");
    
    // Admin can remove any item, users can only remove their own items
    if (user.role !== "admin" && orderItem.userId !== args.currentUserId) {
      throw new Error("Unauthorized");
    }
    
    // Verify order is still open
    const order = await ctx.db.get(orderItem.orderId);
    if (!order || order.status !== "open") {
      throw new Error("Order is not open for modifications");
    }
    
    await ctx.db.delete(args.orderItemId);
    return { success: true };
  },
});
