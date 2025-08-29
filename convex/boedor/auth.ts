import { action, internalMutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import type { Id } from "../_generated/dataModel";

// Helper function to get current user
export const getCurrentUser = query({
  args: { userId: v.optional(v.id("boedor_users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    return await ctx.db.get(args.userId);
  },
});

// Internal mutation to create user with hashed password
export const createUserInternal = internalMutation({
  args: {
    username: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("driver"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    // Check if username already exists
    const existingUser = await ctx.db
      .query("boedor_users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Create user
    const userId = await ctx.db.insert("boedor_users", {
      username: args.username,
      passwordHash: args.passwordHash,
      role: args.role,
    });

    return { userId, username: args.username, role: args.role };
  },
});

// Internal mutation to get user by username
export const getUserByUsernameInternal = internalMutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("boedor_users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
  },
});

// Register new user (using action for bcrypt)
export const register = action({
  args: {
    username: v.string(),
    password: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("driver"), v.literal("user")),
  },
  handler: async (ctx, args): Promise<{ userId: Id<"boedor_users">; username: string; role: "super_admin" | "admin" | "driver" | "user" }> => {
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(args.password, saltRounds);

    // Call internal mutation to create user
    return await ctx.runMutation(internal.boedor.auth.createUserInternal, {
      username: args.username,
      passwordHash,
      role: args.role,
    });
  },
});

// Login user
export const login = action({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ userId: Id<"boedor_users">; username: string; role: "super_admin" | "admin" | "driver" | "user" }> => {
    // Find user by username
    const user = await ctx.runMutation(internal.boedor.auth.getUserByUsernameInternal, {
      username: args.username,
    });

    if (!user) {
      throw new Error("Invalid username or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(args.password, user.passwordHash);
    
    if (!isValidPassword) {
      throw new Error("Invalid username or password");
    }

    return {
      userId: user._id,
      username: user.username,
      role: user.role,
    };
  },
});

// Get user by ID (for session management)
export const getUserById = query({
  args: { userId: v.id("boedor_users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    return {
      _id: user._id,
      username: user.username,
      role: user.role,
    };
  },
});
