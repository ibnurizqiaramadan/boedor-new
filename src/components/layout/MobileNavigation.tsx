'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Gauge,
  ShoppingCart,
  SquareMenu,
  ShoppingBag,
  LogOut,
} from 'lucide-react';

const navigationItems = {
  super_admin: [
    { name: 'Dasbor', href: '/admin', icon: Gauge },
    { name: 'Menu', href: '/admin/menu', icon: SquareMenu },
    { name: 'Pesanan', href: '/admin/orders', icon: ShoppingBag },
  ],
  admin: [
    { name: 'Dasbor', href: '/admin', icon: Gauge },
    { name: 'Menu', href: '/admin/menu', icon: SquareMenu },
    { name: 'Pesanan', href: '/admin/orders', icon: ShoppingBag },
  ],
  driver: [
    { name: 'Dasbor', href: '/driver', icon: Gauge },
    { name: 'Menu', href: '/driver/menu', icon: SquareMenu },
    { name: 'Pesanan', href: '/driver/orders', icon: ShoppingCart },
  ],
  user: [
    { name: 'Dasbor', href: '/user', icon: Gauge },
    { name: 'Menu', href: '/user/menu', icon: SquareMenu },
    { name: 'Pesanan', href: '/user/pesanan', icon: ShoppingBag },
  ],
};

export function MobileNavigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [ confirmLogout, setConfirmLogout ] = useState(false);

  if (!user) return null;

  const userNavItems = navigationItems[user.role] || [];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
      <nav className="flex">
        {userNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors',
                isActive ?
                  'text-primary bg-primary/10' :
                  'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 mb-1',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setConfirmLogout(true)}
          className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
        >
          <LogOut className="h-5 w-5 mb-1" />
          <span className="truncate">Keluar</span>
        </button>
      </nav>

      <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluar dari akun?</DialogTitle>
            <DialogDescription>Anda harus masuk lagi untuk menggunakan Boedor.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmLogout(false)}>Batal</Button>
            <Button variant="destructive" onClick={logout}>Keluar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
