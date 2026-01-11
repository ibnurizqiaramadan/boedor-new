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

// Realtime query - get all driver positions (admin and drivers can view)
export const getAllDriverPositions = query({
  args: { currentUserId: v.id("users") },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin", "driver", "user"]);
    
    return await ctx.db.query("boedor_driver_positions").collect();
  },
});

// Get driver position by driver ID
export const getDriverPosition = query({
  args: { 
    driverId: v.id("users"),
    currentUserId: v.id("users") 
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin", "driver", "user"]);
    
    return await ctx.db
      .query("boedor_driver_positions")
      .withIndex("by_driver", (q) => q.eq("driverId", args.driverId))
      .first();
  },
});

// Update driver position (drivers can update their own position, admin can update any)
export const updateDriverPosition = mutation({
  args: {
    driverId: v.id("users"),
    lat: v.number(),
    lng: v.number(),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.currentUserId);
    if (!user) throw new Error("Unauthorized");
    
    // Verify target is a driver
    const driver = await ctx.db.get(args.driverId);
    if (!driver || driver.role !== "driver") {
      throw new Error("Target user is not a driver");
    }
    
    // Admin can update any driver's position, drivers can only update their own
    if (user.role !== "admin" && args.driverId !== args.currentUserId) {
      throw new Error("Unauthorized");
    }
    
    // Check if position record exists
    const existingPosition = await ctx.db
      .query("boedor_driver_positions")
      .withIndex("by_driver", (q) => q.eq("driverId", args.driverId))
      .first();
    
    if (existingPosition) {
      // Update existing position
      await ctx.db.patch(existingPosition._id, {
        lat: args.lat,
        lng: args.lng,
        updatedAt: Date.now(),
      });
      return await ctx.db.get(existingPosition._id);
    } else {
      // Create new position record
      const positionId = await ctx.db.insert("boedor_driver_positions", {
        driverId: args.driverId,
        lat: args.lat,
        lng: args.lng,
        updatedAt: Date.now(),
      });
      return await ctx.db.get(positionId);
    }
  },
});

// Delete driver position (admin only)
export const deleteDriverPosition = mutation({
  args: {
    driverId: v.id("users"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.currentUserId, ["super_admin", "admin"]);
    
    const position = await ctx.db
      .query("boedor_driver_positions")
      .withIndex("by_driver", (q) => q.eq("driverId", args.driverId))
      .first();
    
    if (position) {
      await ctx.db.delete(position._id);
    }
    
    return { success: true };
  },
});
