import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  boedor_menu: defineTable({
    name: v.string(),
    price: v.number(),
    createdBy: v.id("users"),
  }),

  boedor_orders: defineTable({
    driverId: v.id("users"),
    status: v.union(v.literal("open"), v.literal("closed"), v.literal("completed")),
    createdAt: v.number(),
  }).index("by_driver", ["driverId"])
    .index("by_status", ["status"]),

  boedor_order_items: defineTable({
    orderId: v.id("boedor_orders"),
    menuId: v.id("boedor_menu"),
    userId: v.id("users"),
    qty: v.number(),
    note: v.optional(v.string()),
    paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("cardless"), v.literal("dana"))),
    amount: v.optional(v.number()),
  }).index("by_order", ["orderId"])
    .index("by_user", ["userId"]),

  boedor_payment: defineTable({
    orderId: v.id("boedor_orders"),
    userId: v.id("users"),
    paymentMethod: v.union(v.literal("cash"), v.literal("cardless"), v.literal("dana")),
    amount: v.number(),
    createdAt: v.number(),
  }).index("by_order", ["orderId"])
    .index("by_user", ["userId"])
    .index("by_order_user", ["orderId", "userId"]),

  boedor_driver_positions: defineTable({
    driverId: v.id("users"),
    lat: v.number(),
    lng: v.number(),
    updatedAt: v.number(),
  }).index("by_driver", ["driverId"]),

  // Unified users table (OAuth + username/password)
  users: defineTable({
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    role: v.optional(v.union(v.literal("super_admin"), v.literal("admin"), v.literal("driver"), v.literal("user"))),
  })
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_emailVerified", ["emailVerified"]),
  
  accounts: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    providerAccountId: v.string(),
    type: v.string(),
    access_token: v.optional(v.string()),
    refresh_token: v.optional(v.string()),
    expires_at: v.optional(v.number()),
    token_type: v.optional(v.string()),
    scope: v.optional(v.string()),
    id_token: v.optional(v.string()),
    session_state: v.optional(v.string()),
  })
    .index("by_provider", ["provider"])
    .index("by_providerAccountId", ["providerAccountId"])
    .index("by_userId", ["userId"]),
  
  sessions: defineTable({
    sessionToken: v.string(),
    userId: v.id("users"),
    expires: v.string(),
  })
    .index("by_sessionToken", ["sessionToken"])
    .index("by_expires", ["expires"])
    .index("by_userId", ["userId"]),
  
  verificationTokens: defineTable({
    identifier: v.string(),
    token: v.string(),
    expires: v.string(),
  })
    .index("by_token", ["token"])
    .index("by_identifier", ["identifier"])
    .index("by_expires", ["expires"]),
};
