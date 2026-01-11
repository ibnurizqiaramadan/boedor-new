import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "./utils";

// Get payment by order and user
export const getPaymentByOrderUser = query({
  args: { 
    orderId: v.id("boedor_orders"),
    userId: v.id("users"),
    currentUserId: v.id("users") 
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin", "driver", "user"]);
    
    return await ctx.db
      .query("boedor_payment")
      .withIndex("by_order_user", (q) => q.eq("orderId", args.orderId).eq("userId", args.userId))
      .first();
  },
});

// Get all payments for an order
export const getPaymentsByOrder = query({
  args: { 
    orderId: v.id("boedor_orders"),
    currentUserId: v.id("users") 
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin", "driver", "user"]);
    
    return await ctx.db
      .query("boedor_payment")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();
  },
});

// Get payments by user
export const getPaymentsByUser = query({
  args: { 
    userId: v.id("users"),
    currentUserId: v.id("users") 
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.currentUserId);
    if (!user) throw new Error("Unauthorized");
    
    // Admin can view any user's payments, users can view their own payments
    if (user.role !== "admin" && user.role !== "super_admin" && args.userId !== args.currentUserId) {
      throw new Error("Unauthorized");
    }
    
    return await ctx.db
      .query("boedor_payment")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Create or update payment for user in order
export const upsertPayment = mutation({
  args: {
    orderId: v.id("boedor_orders"),
    paymentMethod: v.union(v.literal("cash"), v.literal("cardless"), v.literal("dana")),
    amount: v.number(),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin", "driver", "user"]);
    
    // Verify order exists and is open
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "open") throw new Error("Order is not open for payment updates");
    
    // Check if payment already exists for this user in this order
    const existingPayment = await ctx.db
      .query("boedor_payment")
      .withIndex("by_order_user", (q) => q.eq("orderId", args.orderId).eq("userId", args.currentUserId))
      .first();
    
    if (existingPayment) {
      // Update existing payment
      await ctx.db.patch(existingPayment._id, {
        paymentMethod: args.paymentMethod,
        amount: args.amount,
      });
      return await ctx.db.get(existingPayment._id);
    } else {
      // Create new payment
      const paymentId = await ctx.db.insert("boedor_payment", {
        orderId: args.orderId,
        userId: args.currentUserId,
        paymentMethod: args.paymentMethod,
        amount: args.amount,
        createdAt: Date.now(),
      });
      return await ctx.db.get(paymentId);
    }
  },
});

// Delete payment
export const deletePayment = mutation({
  args: {
    paymentId: v.id("boedor_payment"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.currentUserId);
    if (!user) throw new Error("Unauthorized");
    
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");
    
    // Admin can delete any payment, users can only delete their own payments
    if (user.role !== "admin" && user.role !== "super_admin" && payment.userId !== args.currentUserId) {
      throw new Error("Unauthorized");
    }
    
    // Verify order is still open
    const order = await ctx.db.get(payment.orderId);
    if (!order || order.status !== "open") {
      throw new Error("Order is not open for payment modifications");
    }
    
    await ctx.db.delete(args.paymentId);
    return { success: true };
  },
});
