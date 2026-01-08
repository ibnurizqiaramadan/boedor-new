import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// User functions for NextAuth adapter
export const createNextAuthUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      ...args,
      role: "user", // Default role for new users
    });
    return userId;
  },
});

export const getNextAuthUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getNextAuthUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user;
  },
});

export const updateNextAuthUser = mutation({
  args: {
    id: v.id("users"),
    data: v.object({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      emailVerified: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { id, data } = args;
    await ctx.db.patch(id, data);
    return await ctx.db.get(id);
  },
});

export const deleteNextAuthUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Account functions for NextAuth adapter
export const createNextAuthAccount = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("accounts", args);
  },
});

export const getNextAuthAccountByProviderAccount = query({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_providerAccountId", (q) => 
        q.eq("providerAccountId", args.providerAccountId)
      )
      .filter((q) => q.eq(q.field("provider"), args.provider))
      .first();
    return account;
  },
});

export const deleteNextAuthAccount = mutation({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_providerAccountId", (q) => 
        q.eq("providerAccountId", args.providerAccountId)
      )
      .filter((q) => q.eq(q.field("provider"), args.provider))
      .first();
    
    if (account) {
      await ctx.db.delete(account._id);
    }
  },
});

// Session functions for NextAuth adapter
export const createNextAuthSession = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    expires: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sessions", args);
  },
});

export const getNextAuthSessionByToken = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    return session;
  },
});

export const updateNextAuthSession = mutation({
  args: {
    sessionToken: v.string(),
    data: v.object({
      userId: v.optional(v.id("users")),
      expires: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    
    if (session) {
      await ctx.db.patch(session._id, args.data);
      return await ctx.db.get(session._id);
    }
    throw new Error("Session not found");
  },
});

export const deleteNextAuthSession = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});
