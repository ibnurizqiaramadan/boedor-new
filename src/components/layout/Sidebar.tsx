'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShoppingBag,
  LogOut,
  SquareMenu,
  ShoppingCart,
  Gauge,
  UtensilsCrossed,
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

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const userNavItems = navigationItems[user.role] || [];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-6 bg-card overflow-y-auto border-r border-border">
        <div className="flex items-center gap-2.5 flex-shrink-0 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UtensilsCrossed className="h-5 w-5" aria-hidden />
          </span>
          <h1 className="font-display text-2xl text-foreground">Boedor</h1>
        </div>

        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-3 pb-4 space-y-1">
            {userNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                    isActive ?
                      'bg-primary text-primary-foreground shadow-sm' :
                      'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex-shrink-0 px-3 pb-4">
            <div className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
              Masuk sebagai: <span className="font-medium text-foreground">{user.username || user.name || user.email}</span>
              <br />
              Peran: <span className="font-medium capitalize text-foreground">{user.role}</span>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              className="mt-1 w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Keluar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
