import { type Adapter, type AdapterUser, type AdapterAccount, type AdapterSession } from "next-auth/adapters";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { cookies } from "next/headers";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convexClient = new ConvexHttpClient(convexUrl);

export function ConvexAdapter(): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      const convex = api;
      
      // Check if this is a driver registration
      const cookieStore = await cookies();
      const driverCookie = cookieStore.get('driver-registration');
      const isDriver = driverCookie?.value === 'true';
      
      console.log('Creating user - Driver cookie:', driverCookie?.value, 'Is driver:', isDriver);
      
      // Clear the cookie after use
      if (isDriver) {
        cookieStore.delete('driver-registration');
      }
      
      const userId = await convexClient.mutation(convex.boedor.auth.createNextAuthUser, {
        email: user.email,
        name: user.name || undefined,
        image: user.image || undefined,
        emailVerified: user.emailVerified?.toISOString() || undefined,
        role: isDriver ? 'driver' : 'user',
      });

      console.log('User created with ID:', userId, 'Role:', isDriver ? 'driver' : 'user');

      return {
        id: userId,
        ...user,
      };
    },

    async getUser(id) {
      const convex = api;
      const user = await convexClient.query(convex.boedor.auth.getNextAuthUser, { id: id as Id<"users"> });
      if (!user) return null;

      return {
        id: user._id,
        email: user.email || '',
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
      };
    },

    async getUserByEmail(email) {
      const convex = api;
      const user = await convexClient.query(convex.boedor.auth.getNextAuthUserByEmail, { email });
      if (!user) return null;

      return {
        id: user._id,
        email: user.email || '',
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const convex = api;
      const account = await convexClient.query(convex.boedor.auth.getNextAuthAccountByProviderAccount, {
        provider,
        providerAccountId,
      });
      if (!account) return null;

      const user = await convexClient.query(convex.boedor.auth.getNextAuthUser, { id: account.userId });
      if (!user) return null;

      return {
        id: user._id,
        email: user.email || '',
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
      };
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const convex = api;
      
      // Check if email is provided as it's required
      if (!user.email) {
        throw new Error("Email is required to update user");
      }
      
      const updatedUser = await convexClient.mutation(convex.boedor.auth.updateNextAuthUser, {
        id: user.id as Id<"users">,
        data: {
          name: user.name || undefined,
          image: user.image || undefined,
          emailVerified: user.emailVerified?.toISOString() || undefined,
        },
      });

      // Return the user with all required fields
      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified || null,
        name: user.name || null,
        image: user.image || null,
      };
    },

    async deleteUser(userId) {
      const convex = api;
      await convexClient.mutation(convex.boedor.auth.deleteNextAuthUser, { id: userId as Id<"users"> });
    },

    async linkAccount(account: AdapterAccount) {
      const convex = api;
      await convexClient.mutation(convex.boedor.auth.createNextAuthAccount, {
        userId: account.userId as Id<"users">,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        type: account.type,
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      });
    },

    async unlinkAccount({ providerAccountId, provider }) {
      const convex = api;
      await convexClient.mutation(convex.boedor.auth.deleteNextAuthAccount, {
        provider,
        providerAccountId,
      });
    },

    async createSession({ sessionToken, userId, expires }) {
      const convex = api;
      await convexClient.mutation(convex.boedor.auth.createNextAuthSession, {
        sessionToken,
        userId: userId as Id<"users">,
        expires: expires.toISOString(),
      });

      return {
        sessionToken,
        userId,
        expires,
      };
    },

    async getSessionAndUser(sessionToken) {
      const convex = api;
      const session = await convexClient.query(convex.boedor.auth.getNextAuthSessionByToken, {
        sessionToken,
      });
      if (!session) return null;

      const user = await convexClient.query(convex.boedor.auth.getNextAuthUser, { id: session.userId });
      if (!user) return null;

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: new Date(session.expires),
        },
        user: {
          id: user._id,
          email: user.email || '',
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        },
      };
    },

    async updateSession({ sessionToken, userId, expires }) {
      const convex = api;
      const updatedSession = await convexClient.mutation(convex.boedor.auth.updateNextAuthSession, {
        sessionToken,
        data: {
          expires: expires?.toISOString(),
          userId: userId ? userId as Id<"users"> : undefined,
        },
      });

      if (!updatedSession) return null;

      return {
        sessionToken: updatedSession.sessionToken,
        userId: updatedSession.userId,
        expires: new Date(updatedSession.expires),
      };
    },

    async deleteSession(sessionToken) {
      const convex = api;
      await convexClient.mutation(convex.boedor.auth.deleteNextAuthSession, { sessionToken });
    },
  };
}
