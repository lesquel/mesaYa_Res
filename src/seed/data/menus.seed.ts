import { MoneyVO } from '@shared/domain/entities/values/money.vo';
import { restaurantsSeed } from './restaurants.seed';

export interface MenuSeedData {
  restaurantIndex: number;
  name: string;
  description: string;
  price: MoneyVO;
  imageUrl: string;
}

const menuNames = [
  'Menú Ejecutivo',
  'Menú Chef',
  'Menú de Temporada',
  'Menú Vegetariano',
  'Menú Degustación',
  'Menú Urbano',
  'Menú Brasa',
  'Menú Fusión',
  'Menú Premium',
  'Menú Delivery',
];

const imageUrls = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
  'https://images.unsplash.com/photo-1503602642458-232111445657',
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187',
  'https://images.unsplash.com/photo-1551218808-94e220e084d2',
  'https://images.unsplash.com/photo-1495195134817-aeb325a55b65',
  'https://images.unsplash.com/photo-1521305916504-4a1121188589',
  'https://images.unsplash.com/photo-1527515637464-3c74f6ba5b10',
];

export const menusSeed: MenuSeedData[] = restaurantsSeed.map((_, index) => ({
  restaurantIndex: index,
  name: menuNames[index] ?? `Menú Especial ${index + 1}`,
  description: `${menuNames[index] ?? 'Menú Especial'} con ingredientes frescos`,
  price: new MoneyVO(12 + index * 1.8),
  imageUrl: imageUrls[index % imageUrls.length],
}));
