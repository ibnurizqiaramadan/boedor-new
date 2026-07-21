import { type QueryCtx, type MutationCtx } from "../_generated/server";
import { type Doc } from "../_generated/dataModel";

/**
 * Resolve the authenticated user from the request's JWT identity.
 * Throws if the request is unauthenticated or the user no longer exists.
 */
export async function getAuthUser(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const userId = ctx.db.normalizeId("users", identity.subject);
  if (!userId) throw new Error("Unauthorized");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("Unauthorized");
  return user;
}

export function isAdmin(user: Doc<"users">): boolean {
  return user.role === "admin" || user.role === "super_admin";
}

/**
 * Require the authenticated user to have one of the allowed roles.
 * Returns the user document.
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: string[],
): Promise<Doc<"users">> {
  const user = await getAuthUser(ctx);
  if (!allowedRoles.includes(user.role || "user")) {
    throw new Error("Unauthorized");
  }
  return user;
}
