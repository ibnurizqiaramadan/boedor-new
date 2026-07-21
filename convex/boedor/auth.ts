import { action, internalMutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import type { Id } from "../_generated/dataModel";
import { requireRole } from "./utils";

// Get the currently authenticated user (from JWT identity)
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = ctx.db.normalizeId("users", identity.subject);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
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

// Internal mutation to create user with hashed password (admin only)
export const createUserInternal = internalMutation({
  args: {
    username: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("driver"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    // Identity propagates from the calling action; only admins may create users
    const caller = await requireRole(ctx, ["super_admin", "admin"]);
    if (args.role === "super_admin" && caller.role !== "super_admin") {
      throw new Error("Unauthorized");
    }

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

// Register new user (using action for bcrypt) — admin only, enforced in createUserInternal
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

// Export nextauth functions
export * from "./nextauth";
