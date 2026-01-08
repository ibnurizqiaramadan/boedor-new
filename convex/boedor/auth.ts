import { action, internalMutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import type { Id } from "../_generated/dataModel";

// Helper function to get current user
export const getCurrentUser = query({
  args: { userId: v.optional(v.id("users")) },
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
    // Normalize & validate username: no spaces allowed
    const cleanUsername = args.username.trim();
    if (!/^\S+$/.test(cleanUsername)) {
      throw new Error("Username tidak boleh mengandung spasi");
    }

    // Check if username already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", cleanUsername))
      .first();

    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Create user
    const userId = await ctx.db.insert("users", {
      username: cleanUsername,
      passwordHash: args.passwordHash,
      role: args.role,
    });

    return { userId, username: cleanUsername, role: args.role };
  },
});

// Internal mutation to get user by username
export const getUserByUsernameInternal = internalMutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
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
  handler: async (ctx, args): Promise<{ userId: Id<"users">; username: string; role: "super_admin" | "admin" | "driver" | "user" }> => {
    // Normalize & validate username on action layer as well
    const cleanUsername = args.username.trim();
    if (!/^\S+$/.test(cleanUsername)) {
      throw new Error("Username tidak boleh mengandung spasi");
    }
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(args.password, saltRounds);

    // Call internal mutation to create user
    return await ctx.runMutation(internal.boedor.auth.createUserInternal, {
      username: cleanUsername,
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
  handler: async (ctx, args): Promise<{ userId: Id<"users">; username: string; role: "super_admin" | "admin" | "driver" | "user" }> => {
    // Find user by username
    const user = await ctx.runMutation(internal.boedor.auth.getUserByUsernameInternal, {
      username: args.username,
    });

    if (!user) {
      throw new Error("Invalid username or password");
    }

    if (!user.passwordHash) {
      throw new Error("This account uses OAuth login");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(args.password, user.passwordHash);
    
    if (!isValidPassword) {
      throw new Error("Invalid username or password");
    }

    return {
      userId: user._id,
      username: user.username || "",
      role: user.role || "user",
    };
  },
});

// Get user by ID (for session management)
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role || "user",
    };
  },
});

// Export nextauth functions
export * from "./nextauth";
