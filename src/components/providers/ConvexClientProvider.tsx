'use client';

import { ConvexProvider } from 'convex/react';
import { AuthProvider } from '@/contexts/AuthContext';
import convex from '@/lib/convex';

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ConvexProvider>
  );
}
