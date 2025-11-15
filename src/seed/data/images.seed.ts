export interface ImageSeedData {
  url: string;
  storagePath: string;
  title: string;
  description: string;
  entityIndex: number;
}

const imageDefinitions: Omit<ImageSeedData, 'entityIndex'>[] = [
  {
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    storagePath: '/storage/images/restaurant1.jpg',
    title: 'Restaurante Brisa',
    description: 'Vista aérea del restaurante seleccionado',
  },
  {
    url: 'https://images.unsplash.com/photo-1498654200792-0c92a2dd6b0b',
    storagePath: '/storage/images/restaurant2.jpg',
    title: 'Interior Elegante',
    description: 'Ambiente interior moderno y luminoso',
  },
  {
    url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1',
    storagePath: '/storage/images/restaurant3.jpg',
    title: 'Terraza Panorámica',
    description: 'Terraza abierta con vista a la ciudad',
  },
  {
    url: 'https://images.unsplash.com/photo-1478144592103-25e218a04891',
    storagePath: '/storage/images/dish1.jpg',
    title: 'Entrada del Chef',
    description: 'Plato principal artesano',
  },
  {
    url: 'https://images.unsplash.com/photo-1497534446932-c925b458314e',
    storagePath: '/storage/images/dish2.jpg',
    title: 'Pescado del Día',
    description: 'Fresco pescado al grill',
  },
  {
    url: 'https://images.unsplash.com/photo-1504674900247-acd25b5cda1a',
    storagePath: '/storage/images/dish3.jpg',
    title: 'Postre Dulce',
    description: 'Selección de postres del chef',
  },
  {
    url: 'https://images.unsplash.com/photo-1504674900247-2c1bfc1d836c',
    storagePath: '/storage/images/restaurant4.jpg',
    title: 'Cocteles y Barra',
    description: 'Barra con bebidas premium',
  },
  {
    url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17',
    storagePath: '/storage/images/dish4.jpg',
    title: 'Carne a la Parrilla',
    description: 'Costillas doradas sobre parrilla abierta',
  },
  {
    url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187',
    storagePath: '/storage/images/dish5.jpg',
    title: 'Ensalada Deluxe',
    description: 'Mezcla fresca en propuesta vegetariana',
  },
  {
    url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e',
    storagePath: '/storage/images/restaurant5.jpg',
    title: 'Sala VIP',
    description: 'Espacio exclusivo para grupos privados',
  },
  {
    url: 'https://images.unsplash.com/photo-1512058564366-c9e7f19d8f6c',
    storagePath: '/storage/images/restaurant6.jpg',
    title: 'Lounge Nocturno',
    description: 'Ambiente nocturno con DJ residente',
  },
  {
    url: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0',
    storagePath: '/storage/images/dish6.jpg',
    title: 'Sushi Selection',
    description: 'Selección japonesa de autor',
  },
];

export const imagesSeed: ImageSeedData[] = imageDefinitions.map(
  (image, index) => ({
    ...image,
    entityIndex: Math.floor(index / 2),
  }),
);
