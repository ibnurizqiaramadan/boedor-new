import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  boedor_users: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("driver"), v.literal("user")),
  }).index("by_username", ["username"]),

  boedor_menu: defineTable({
    name: v.string(),
    price: v.number(),
    createdBy: v.id("boedor_users"),
  }),

  boedor_orders: defineTable({
    driverId: v.id("boedor_users"),
    status: v.union(v.literal("open"), v.literal("closed"), v.literal("completed")),
    createdAt: v.number(),
  }).index("by_driver", ["driverId"])
    .index("by_status", ["status"]),

  boedor_order_items: defineTable({
    orderId: v.id("boedor_orders"),
    menuId: v.id("boedor_menu"),
    userId: v.id("boedor_users"),
    qty: v.number(),
    note: v.optional(v.string()),
    // Legacy fields for backward compatibility with existing data
    paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("cardless"), v.literal("dana"))),
    amount: v.optional(v.number()),
  }).index("by_order", ["orderId"])
    .index("by_user", ["userId"]),

  boedor_payment: defineTable({
    orderId: v.id("boedor_orders"),
    userId: v.id("boedor_users"),
    paymentMethod: v.union(v.literal("cash"), v.literal("cardless"), v.literal("dana")),
    amount: v.number(),
    createdAt: v.number(),
  }).index("by_order", ["orderId"])
    .index("by_user", ["userId"])
    .index("by_order_user", ["orderId", "userId"]),

  boedor_driver_positions: defineTable({
    driverId: v.id("boedor_users"),
    lat: v.number(),
    lng: v.number(),
    updatedAt: v.number(),
  }).index("by_driver", ["driverId"]),
};
