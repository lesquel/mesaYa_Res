import { MoneyVO } from '@shared/domain/entities/values/money.vo';
import { menusSeed } from './menus.seed';

export interface DishSeedData {
  menuIndex: number;
  name: string;
  description: string;
  price: MoneyVO;
  imageUrl: string;
}

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

export const dishesSeed: DishSeedData[] = menusSeed.flatMap((menu, menuIndex) =>
  dishTemplates.map((template, templateIndex) => ({
    menuIndex,
    name: `${menu.name} ${template.suffix}`,
    description: `${template.note} inspirado en la propuesta ${menu.name}`,
    price: new MoneyVO(
      Number.parseFloat((12 + menuIndex * 1.5 + templateIndex * 2).toFixed(2)),
    ),
    imageUrl: dishImageUrls[(menuIndex + templateIndex) % dishImageUrls.length],
  })),
);
