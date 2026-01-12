import type { Id, Doc } from '@/convex/_generated/dataModel';

// User types
export type User = Doc<'users'>;
export type UserId = Id<'users'>;

// Menu types
export type MenuItem = Doc<'boedor_menu'>;
export type MenuItemId = Id<'boedor_menu'>;

// Order types
export type Order = Doc<'boedor_orders'>;
export type OrderId = Id<'boedor_orders'>;
export type OrderStatus = 'open' | 'closed' | 'completed';

// Order Item types
export type OrderItem = Doc<'boedor_order_items'>;
export type OrderItemId = Id<'boedor_order_items'>;
export type PaymentMethod = 'cash' | 'cardless' | 'dana';

// Payment types
export type Payment = Doc<'boedor_payment'>;
export type PaymentId = Id<'boedor_payment'>;

// Driver Position types
export type DriverPosition = Doc<'boedor_driver_positions'>;
export type DriverPositionId = Id<'boedor_driver_positions'>;

// User roles
export type UserRole = 'super_admin' | 'admin' | 'driver' | 'user';


// Helper types for frontend components
export interface OrderWithDriver extends Order {
  driver?: User | null;
}

export interface OrderItemWithMenu extends OrderItem {
  menuItem?: MenuItem | null;
}

export interface PaymentWithUser extends Payment {
  user?: User | null;
}

export interface UserWithOrders extends User {
  orders?: Order[];
  orderItems?: OrderItem[];
}