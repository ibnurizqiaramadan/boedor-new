import { mutation, query, MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { getAuthUser, isAdmin } from "./utils";

// Realtime query - get order items by order ID
export const getOrderItemsByOrder = query({
  args: {
    orderId: v.id("boedor_orders"),
  },
  handler: async (ctx, args) => {
    await getAuthUser(ctx);

    return await ctx.db
      .query("boedor_order_items")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();
  },
});

// Get order items by user
export const getOrderItemsByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);

    // Admin can view any user's items, users can view their own items
    if (!isAdmin(user) && args.userId !== user._id) {
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
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);

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
        q.eq(q.field("userId"), user._id)
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
        userId: user._id,
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
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);

    const orderItem = await ctx.db.get(args.orderItemId);
    if (!orderItem) throw new Error("Order item not found");

    // Admin can update any item, users can only update their own items
    if (!isAdmin(user) && orderItem.userId !== user._id) {
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

// Guard bersama: hanya driver pemilik order (atau admin), order belum completed
async function requireOrderDriver(ctx: MutationCtx, orderItemId: Id<"boedor_order_items">) {
  const user = await getAuthUser(ctx);

  const orderItem = await ctx.db.get(orderItemId);
  if (!orderItem) throw new Error("Order item not found");

  const order = await ctx.db.get(orderItem.orderId);
  if (!order) throw new Error("Order not found");
  if (order.status === "completed") throw new Error("Order is already completed");

  if (!isAdmin(user) && order.driverId !== user._id) {
    throw new Error("Unauthorized");
  }

  return { orderItem, order };
}

// Set actual unit price for a custom-priced item (driver of the order or admin)
export const setCustomPrice = mutation({
  args: {
    orderItemId: v.id("boedor_order_items"),
    customPrice: v.number(),
  },
  handler: async (ctx, args) => {
    await requireOrderDriver(ctx, args.orderItemId);

    if (args.customPrice < 0) throw new Error("Harga tidak boleh negatif");

    await ctx.db.patch(args.orderItemId, { customPrice: args.customPrice });
    return await ctx.db.get(args.orderItemId);
  },
});

// Mark order item as purchased (driver of the order or admin)
export const setPurchased = mutation({
  args: {
    orderItemId: v.id("boedor_order_items"),
    purchased: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { orderItem, order } = await requireOrderDriver(ctx, args.orderItemId);

    await ctx.db.patch(args.orderItemId, { purchased: args.purchased });

    // semua item sudah dibeli → order otomatis selesai (guard di atas menjamin status belum completed)
    if (args.purchased) {
      const items = await ctx.db
        .query("boedor_order_items")
        .withIndex("by_order", (q) => q.eq("orderId", orderItem.orderId))
        .collect();
      if (items.every((i) => i.purchased)) {
        await ctx.db.patch(orderItem.orderId, { status: "completed" });
      }
    }

    return await ctx.db.get(args.orderItemId);
  },
});

// Remove order item
export const removeOrderItem = mutation({
  args: {
    orderItemId: v.id("boedor_order_items"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);

    const orderItem = await ctx.db.get(args.orderItemId);
    if (!orderItem) throw new Error("Order item not found");

    // Admin can remove any item, users can only remove their own items
    if (!isAdmin(user) && orderItem.userId !== user._id) {
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
