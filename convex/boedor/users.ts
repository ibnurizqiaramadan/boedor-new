import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Helper function to verify user role
async function requireRole(ctx: { db: any; auth: any }, userId: string, allowedRoles: string[]) {
  const user = await ctx.db.get(userId);
  if (!user || !allowedRoles.includes(user.role || 'user')) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Realtime query - get all users (admin only)
export const getAllUsers = query({
  args: { currentUserId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db.get(args.currentUserId);
    
    if (!currentUser || ((currentUser.role || 'user') !== "admin" && (currentUser.role || 'user') !== "super_admin")) {
      throw new Error("Unauthorized");
    }

    // Filter out super_admin users from the list
    const allUsers = await ctx.db.query("users").collect();
    return allUsers.filter(user => (user.role || 'user') !== "super_admin");
  },
});

// Get usernames by IDs (for drivers to see participant names)
export const getUsernamesByIds = query({
  args: { 
    userIds: v.array(v.id("users")),
    currentUserId: v.id("users") 
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin", "driver", "user"]);
    
    const users = await Promise.all(
      args.userIds.map(async (userId) => {
        const user = await ctx.db.get(userId);
        return user ? { _id: user._id, username: user.username, name: user.name, email: user.email, role: user.role || 'user' } : null;
      })
    );
    
    return users.filter(Boolean);
  },
});

// Get user by ID
export const getUserById = query({
  args: { 
    userId: v.id("users"),
    currentUserId: v.id("users") 
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db.get(args.currentUserId);
    if (!currentUser) throw new Error("Unauthorized");
    
    // Users can view their own profile, admins can view any profile
    if (args.userId !== args.currentUserId && (currentUser.role || 'user') !== "admin") {
      throw new Error("Unauthorized");
    }
    
    return await ctx.db.get(args.userId);
  },
});

// Update user (admin only)
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    currentUserId: v.id("users"),
    username: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("driver"), v.literal("user"))),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin"]);
    
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
    return await ctx.db.get(args.userId);
  },
});

// Delete user (admin only)
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin"]);
    
    // Don't allow deleting self
    if (args.userId === args.currentUserId) {
      throw new Error("Cannot delete your own account");
    }
    
    await ctx.db.delete(args.userId);
    return { success: true };
  },
});
