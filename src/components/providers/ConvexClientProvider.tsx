'use client';

import { ConvexProviderWithAuth } from 'convex/react';
import { useSession } from 'next-auth/react';
import { useCallback, useMemo } from 'react';
import convex from '@/lib/convex';

// Bridges the NextAuth session to Convex: fetches a short-lived JWT that
// Convex validates server-side (convex/auth.config.ts).
function useNextAuthForConvex() {
  const { status } = useSession();

  const fetchAccessToken = useCallback(async () => {
    const res = await fetch('/api/auth/convex-token');
    return res.ok ? await res.text() : null;
  }, []);

  return useMemo(
    () => ({
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      fetchAccessToken,
    }),
    [status, fetchAccessToken],
  );
}

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useNextAuthForConvex}>
      {children}
    </ConvexProviderWithAuth>
  );
}
