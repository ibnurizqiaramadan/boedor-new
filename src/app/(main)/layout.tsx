'use client';

import { ConvexClientProvider } from '@/components/providers/ConvexClientProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { SessionProvider } from 'next-auth/react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ConvexClientProvider>
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </ConvexClientProvider>
    </SessionProvider>
  );
}
