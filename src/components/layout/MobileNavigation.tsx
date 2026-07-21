'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Menu,
  ShoppingCart,
  Plus,
  SquareMenu,
  ShoppingBag,
  LogOut,
} from 'lucide-react';

const navigationItems = {
  super_admin: [
    { name: 'Dasbor', href: '/admin', icon: Users },
    { name: 'Menu', href: '/admin/menu', icon: SquareMenu },
    { name: 'Pesanan', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Keluar', href: '#logout', icon: LogOut, isLogout: true },
  ],
  admin: [
    { name: 'Dasbor', href: '/admin', icon: Users },
    { name: 'Menu', href: '/admin/menu', icon: SquareMenu },
    { name: 'Pesanan', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Keluar', href: '#logout', icon: LogOut, isLogout: true },
  ],
  driver: [
    { name: 'Dasbor', href: '/driver', icon: Menu },
    { name: 'Menu', href: '/driver/menu', icon: SquareMenu },
    { name: 'Pesanan', href: '/driver/orders', icon: ShoppingCart },
    { name: 'Keluar', href: '#logout', icon: LogOut, isLogout: true },
  ],
  user: [
    { name: 'Dasbor', href: '/user', icon: ShoppingCart },
    { name: 'Menu', href: '/user/menu', icon: SquareMenu },
    { name: 'Pesanan', href: '/user/pesanan', icon: Plus },
    { name: 'Keluar', href: '#logout', icon: LogOut, isLogout: true },
  ],
};

export function MobileNavigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const userNavItems = navigationItems[user.role] || [];

  const handleItemClick = (item: any) => {
    if (item.isLogout) {
      logout();
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
      <nav className="flex">
        {userNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isLogout) {
            return (
              <button
                key={item.name}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors',
                  'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                )}
              >
                <Icon className="h-5 w-5 mb-1 text-muted-foreground hover:text-destructive" />
                <span className="truncate">{item.name}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
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
      </nav>
    </div>
  );
}
