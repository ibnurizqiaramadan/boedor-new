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
  Menu,
  ShoppingCart,
  Plus,
  Gauge,
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
    { name: 'Dasbor', href: '/user', icon: ShoppingCart },
    { name: 'Menu', href: '/user/menu', icon: SquareMenu },
    { name: 'Pesanan', href: '/user/pesanan', icon: Plus },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const userNavItems = navigationItems[user.role] || [];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">Boedor</h1>
        </div>

        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {userNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive ?
                      'bg-primary text-primary-foreground' :
                      'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-primary-foreground' : 'text-gray-400 group-hover:text-gray-500',
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex-shrink-0 px-2 pb-4">
            <div className="px-2 py-2 text-sm text-gray-500">
              Masuk sebagai: <span className="font-medium">{user.username}</span>
              <br />
              Peran: <span className="font-medium capitalize">{user.role}</span>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-gray-600 hover:text-gray-900"
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
