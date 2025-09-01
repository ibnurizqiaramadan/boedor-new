import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ConvexClientProvider } from '@/components/providers/ConvexClientProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/providers/ToastProvider';

const geist = Geist({ subsets: [ 'latin' ] });

export const metadata: Metadata = {
  title: 'Boedor - Food Delivery App',
  description: 'A role-based food delivery management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <ConvexClientProvider>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
