export const DEFAULT_PERMISSION_NAMES = [
  'restaurant:create',
  'restaurant:update',
  'restaurant:delete',
  'restaurant:read',
  'section:create',
  'section:update',
  'section:delete',
  'section:read',
] as const;

export const DEFAULT_ROLES: Array<{ name: string; permNames: string[] }> = [
  { name: 'ADMIN', permNames: [...DEFAULT_PERMISSION_NAMES] },
  {
    name: 'OWNER',
    permNames: [
      'restaurant:create',
      'restaurant:update',
      'restaurant:read',
      'section:create',
      'section:update',
      'section:read',
    ],
  },
  { name: 'USER', permNames: ['restaurant:read', 'section:read'] },
];
