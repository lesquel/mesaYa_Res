/**
 * Permisos del rol USER (cliente/usuario final).
 * Puede ver restaurantes, hacer reservas, crear reseñas, etc.
 */
export const USER_PERMISSIONS: readonly string[] = [
  // Restaurant (solo lectura)
  'restaurant:read',
  // Section (solo lectura)
  'section:read',
  // Menu (solo lectura)
  'menu:read',
  // Dish (solo lectura)
  'dish:read',
  // Review (CRUD completo para sus propias reseñas)
  'review:create',
  'review:update',
  'review:delete',
  'review:read',
  // Payment
  'payment:create',
  'payment:read',
  // Reservation (CRUD completo para sus propias reservas)
  'reservation:create',
  'reservation:update',
  'reservation:delete',
  'reservation:read',
  // Table (solo lectura)
  'table:read',
  // Object (solo lectura)
  'object:read',
  // Image (solo lectura)
  'image:read',
  // Section Object (solo lectura)
  'section-object:read',
  // Subscription
  'subscription:create',
  'subscription:update',
  'subscription:delete',
  'subscription:read',
  'subscription-plan:read',
] as const;
