import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Helper function to verify user role
async function requireRole(ctx: any, userId: string, allowedRoles: string[]) {
  const user = await ctx.db.get(userId);
  if (!user || !allowedRoles.includes(user.role || 'user')) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Realtime query - get all orders
export const getAllOrders = query({
  args: { currentUserId: v.id("users") },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin", "driver", "user"]);
    
    return await ctx.db.query("boedor_orders").collect();
  },
});

// Get orders by status
export const getOrdersByStatus = query({
  args: { 
    status: v.union(v.literal("open"), v.literal("closed"), v.literal("completed")),
    currentUserId: v.id("users") 
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin", "driver", "user"]);
    
    return await ctx.db
      .query("boedor_orders")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Get orders by driver
export const getOrdersByDriver = query({
  args: { 
    driverId: v.id("users"),
    currentUserId: v.id("users") 
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.currentUserId);
    if (!user) throw new Error("Unauthorized");
    
    // Admin can view any driver's orders, drivers can view their own orders
    if (user.role !== "admin" && args.driverId !== args.currentUserId) {
      throw new Error("Unauthorized");
    }
    
    return await ctx.db
      .query("boedor_orders")
      .withIndex("by_driver", (q) => q.eq("driverId", args.driverId))
      .collect();
  },
});

// Get order by ID
export const getOrderById = query({
  args: { 
    orderId: v.id("boedor_orders"),
    currentUserId: v.id("users") 
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin", "driver", "user"]);
    
    return await ctx.db.get(args.orderId);
  },
});

// Create order (admin and driver only)
export const createOrder = mutation({
  args: {
    driverId: v.id("users"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["admin", "driver"]);
    
    // Verify the driver exists and has driver role
    const driver = await ctx.db.get(args.driverId);
    if (!driver || driver.role !== "driver") {
      throw new Error("Invalid driver");
    }
    
    const orderId = await ctx.db.insert("boedor_orders", {
      driverId: args.driverId,
      status: "open",
      createdAt: Date.now(),
    });
    
    return await ctx.db.get(orderId);
  },
});

// Update order status (admin and order's driver only)
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("boedor_orders"),
    status: v.union(v.literal("open"), v.literal("closed"), v.literal("completed")),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.currentUserId);
    if (!user) throw new Error("Unauthorized");
    
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    
    // Super admin and admin can update any order, drivers can only update their own orders
    if (user.role !== "super_admin" && user.role !== "admin" && order.driverId !== args.currentUserId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.patch(args.orderId, { status: args.status });
    return await ctx.db.get(args.orderId);
  },
});

// Delete order (admin only)
export const deleteOrder = mutation({
  args: {
    orderId: v.id("boedor_orders"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin"]);
    
    await ctx.db.delete(args.orderId);
    return { success: true };
  },
});
