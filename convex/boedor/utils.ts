import { type QueryCtx, type MutationCtx } from "../_generated/server";
import { type Id } from "../_generated/dataModel";

/**
 * Helper function to verify user role
 * Throws an error if user is not found or doesn't have required role
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  allowedRoles: string[]
): Promise<void> {
  const user = await ctx.db.get(userId);
  if (!user || !allowedRoles.includes(user.role || 'user')) {
    throw new Error("Unauthorized");
  }
}