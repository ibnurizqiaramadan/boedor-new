"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Menu, 
  ShoppingCart, 
  Plus,
  MapPin,
  Settings,
  ShoppingBag
} from "lucide-react";

const navigationItems = {
  super_admin: [
    { name: "Dashboard", href: "/admin", icon: Users },
    { name: "Menu", href: "/admin/menu", icon: Settings },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  ],
  admin: [
    { name: "Dashboard", href: "/admin", icon: Users },
    { name: "Menu", href: "/admin/menu", icon: Settings },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  ],
  driver: [
    { name: "Dashboard", href: "/driver", icon: Menu },
    { name: "Orders", href: "/driver/orders", icon: ShoppingCart },
    { name: "My Position", href: "/position", icon: MapPin },
  ],
  user: [
    { name: "Dashboard", href: "/user", icon: ShoppingCart },
    { name: "Orders", href: "/orders", icon: Plus },
  ],
};

export function MobileNavigation() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const userNavItems = navigationItems[user.role] || [];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <nav className="flex">
        {userNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 mb-1",
                  isActive ? "text-primary" : "text-gray-400"
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
