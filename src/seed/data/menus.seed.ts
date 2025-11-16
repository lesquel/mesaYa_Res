import { MoneyVO } from '@shared/domain/entities/values/money.vo';
import { restaurantsSeed } from './restaurants.seed';

export interface DishSeedData {
  name: string;
  description: string;
  price: MoneyVO;
  imageUrl: string;
}

export interface MenuSeedData {
  restaurantIndex: number;
  name: string;
  description: string;
  price: MoneyVO;
  imageUrl: string;
  dishes: DishSeedData[];
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

const dishTemplates = [
  {
    suffix: 'Entrada',
    note: 'Perfecto para comenzar el banquete',
    multiplier: 1,
  },
  {
    suffix: 'Plato Principal',
    note: 'Fuerza principal del menú',
    multiplier: 1.35,
  },
  {
    suffix: 'Postre',
    note: 'Tentación dulce para finalizar',
    multiplier: 0.85,
  },
];

const dishImageUrls = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
  'https://images.unsplash.com/photo-1498654200792-0c92a2dd6b0b',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17',
  'https://images.unsplash.com/photo-1543352634-2a9c2b1d0b4f',
  'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0',
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187',
  'https://images.unsplash.com/photo-1504674900247-2c1bfc1d836c',
  'https://images.unsplash.com/photo-1495195134817-aeb325a55b65',
  'https://images.unsplash.com/photo-1527515637464-3c74f6ba5b10',
  'https://images.unsplash.com/photo-1532634896-26909d0d2f1c',
];

export const menusSeed: MenuSeedData[] = restaurantsSeed.map((_, index) => {
  const menuName = menuNames[index] ?? `Menú Especial ${index + 1}`;
  const menuDescription = `${menuName} con ingredientes frescos`;
  const menuPrice = new MoneyVO(12 + index * 1.8);

  const dishes: DishSeedData[] = dishTemplates.map(
    (template, templateIndex) => ({
      name: `${menuName} ${template.suffix}`,
      description: `${template.note} inspirado en la propuesta ${menuName}`,
      price: new MoneyVO(
        Number.parseFloat((12 + index * 1.5 + templateIndex * 2).toFixed(2)),
      ),
      imageUrl: dishImageUrls[(index + templateIndex) % dishImageUrls.length],
    }),
  );

  return {
    restaurantIndex: index,
    name: menuName,
    description: menuDescription,
    price: menuPrice,
    imageUrl: imageUrls[index % imageUrls.length],
    dishes,
  };
});
