/**
 * Permisos del rol OWNER (dueño de restaurante).
 * Puede gestionar su restaurante, menús, mesas, secciones, etc.
 */
export const OWNER_PERMISSIONS: readonly string[] = [
  // Restaurant
  'restaurant:create',
  'restaurant:update',
  'restaurant:read',
  // Section
  'section:create',
  'section:update',
  'section:read',
  // Menu
  'menu:create',
  'menu:update',
  'menu:read',
  // Dish
  'dish:create',
  'dish:update',
  'dish:read',
  // Menu Category
  'menu-category:create',
  'menu-category:update',
  'menu-category:delete',
  'menu-category:read',
  // Review
  'review:create',
  'review:update',
  'review:read',
  // Payment
  'payment:read',
  'payment:update',
  // Reservation
  'reservation:create',
  'reservation:update',
  'reservation:read',
  // Table
  'table:create',
  'table:update',
  'table:read',
  // Object
  'object:create',
  'object:update',
  'object:read',
  // Image
  'image:create',
  'image:update',
  'image:read',
  // Section Object
  'section-object:create',
  'section-object:update',
  'section-object:read',
  // Subscription
  'subscription:create',
  'subscription:update',
  'subscription:read',
  'subscription:delete',
  'subscription-plan:read',
] as const;
