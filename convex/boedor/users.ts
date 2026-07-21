import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { type Doc } from "../_generated/dataModel";
import { getAuthUser, isAdmin, requireRole } from "./utils";

// Public-safe projection: never expose passwordHash to clients
function toSafeUser(user: Doc<"users">) {
  return {
    _id: user._id,
    _creationTime: user._creationTime,
    username: user.username,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role || "user",
  };
}

// Realtime query - get all users (admin only)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthUser(ctx);
    if (!isAdmin(currentUser)) {
      throw new Error("Unauthorized");
    }

    // Filter out super_admin users from the list
    const allUsers = await ctx.db.query("users").collect();
    return allUsers
      .filter((user) => (user.role || "user") !== "super_admin")
      .map(toSafeUser);
  },
});

// Get usernames by IDs (for drivers to see participant names)
export const getUsernamesByIds = query({
  args: {
    userIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    await getAuthUser(ctx);

    const users = await Promise.all(
      args.userIds.map(async (userId) => {
        const user = await ctx.db.get(userId);
        return user ? toSafeUser(user) : null;
      })
    );

    return users.filter(Boolean);
  },
});

// Get user by ID
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthUser(ctx);

    // Users can view their own profile, admins can view any profile
    if (args.userId !== currentUser._id && !isAdmin(currentUser)) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(args.userId);
    return user ? toSafeUser(user) : null;
  },
});

// Update user (admin only)
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    username: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("driver"), v.literal("user"))),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["super_admin", "admin"]);

    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found");
    if (target.role === "super_admin") throw new Error("Unauthorized");

    const updateData: Partial<{ username: string; role: "super_admin" | "admin" | "driver" | "user" }> = {};
    if (args.username !== undefined) {
      const cleanUsername = args.username.trim();
      if (!/^\S+$/.test(cleanUsername)) {
        throw new Error("Username tidak boleh mengandung spasi");
      }
      // Ensure username is unique (excluding current user)
      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", cleanUsername))
        .first();
      if (existing && existing._id !== args.userId) {
        throw new Error("Username already exists");
      }
      updateData.username = cleanUsername;
    }
    if (args.role !== undefined) updateData.role = args.role;

    await ctx.db.patch(args.userId, updateData);
    const updated = await ctx.db.get(args.userId);
    return updated ? toSafeUser(updated) : null;
  },
});

// Delete user (admin only)
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["super_admin", "admin"]);

    // Don't allow deleting self
    if (args.userId === currentUser._id) {
      throw new Error("Cannot delete your own account");
    }

    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found");
    if (target.role === "super_admin") throw new Error("Unauthorized");

    await ctx.db.delete(args.userId);
    return { success: true };
  },
});
