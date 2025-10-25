export interface ImageSeedData {
  url: string;
  storagePath: string;
  title: string;
  description: string;
  entityIndex: number; // Index to reference the entity (restaurant, dish, etc.)
}

export const imagesSeed: ImageSeedData[] = [
  {
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    storagePath: '/storage/images/restaurant1.jpg',
    title: 'Restaurant Main',
    description: 'Imagen principal del restaurante',
    entityIndex: 0, // Reference to first restaurant
  },
  {
    url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b',
    storagePath: '/storage/images/restaurant2.jpg',
    title: 'Restaurant Interior',
    description: 'Interior del restaurante',
    entityIndex: 1, // Reference to second restaurant
  },
  {
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    storagePath: '/storage/images/restaurant3.jpg',
    title: 'Restaurant Exterior',
    description: 'Exterior del restaurante',
    entityIndex: 0, // Reference to first restaurant
  },
  {
    url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9',
    storagePath: '/storage/images/dish1.jpg',
    title: 'Dish Main',
    description: 'Plato principal',
    entityIndex: 0, // Reference to first dish/menu item
  },
  {
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    storagePath: '/storage/images/dish2.jpg',
    title: 'Salad Dish',
    description: 'Ensalada fresca',
    entityIndex: 1, // Reference to second dish/menu item
  },
];
