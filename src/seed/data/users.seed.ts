const ownerUsers = Array.from({ length: 10 }, (_, index) => ({
  email: `owner${index + 1}@mesaya.com`,
  name: `Restaurant Owner ${index + 1}`,
  phone: `+59398765432${20 + index}`,
  password: 'Owner123!@#',
  roles: ['OWNER'],
  active: true,
}));

const customerUsers = Array.from({ length: 10 }, (_, index) => ({
  email: `user${index + 1}@mesaya.com`,
  name: `Customer ${index + 1}`,
  phone: `+5939876512${10 + index}`,
  password: 'User123!@#',
  roles: ['USER'],
  active: true,
}));

export const usersSeed = [
  {
    email: 'admin@mesaya.com',
    name: 'Admin User',
    phone: '+593987654321',
    password: 'Admin123!@#',
    roles: ['ADMIN'],
    active: true,
  },
  ...ownerUsers,
  ...customerUsers,
];
