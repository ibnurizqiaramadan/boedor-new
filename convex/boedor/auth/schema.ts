import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
  })
    .index("by_email", ["email"])
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
});
