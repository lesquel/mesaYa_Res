import { MoneyVO } from '@shared/domain/entities/values/money.vo';

export interface DishSeedData {
  menuIndex: number;
  name: string;
  description: string;
  price: MoneyVO;
  imageUrl: string;
}

export const dishesSeed: DishSeedData[] = [
  // Dishes for Menú Ejecutivo
  {
    menuIndex: 0,
    name: 'Ceviche de Camarón',
    description: 'Camarones frescos marinados en limón',
    price: new MoneyVO(8.99),
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae',
  },
  {
    menuIndex: 0,
    name: 'Seco de Pollo',
    description: 'Pollo guisado con especias ecuatorianas',
    price: new MoneyVO(10.99),
    imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
  },
  // Dishes for Menú Vegetariano
  {
    menuIndex: 1,
    name: 'Ensalada Quinoa',
    description: 'Quinoa orgánica con vegetales de temporada',
    price: new MoneyVO(7.99),
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
  },
  {
    menuIndex: 1,
    name: 'Risotto de Champiñones',
    description: 'Arroz cremoso con champiñones silvestres',
    price: new MoneyVO(9.99),
    imageUrl: 'https://images.unsplash.com/photo-1476124369491-f51a24d0d377',
  },
  // Dishes for Menú Mediterráneo
  {
    menuIndex: 2,
    name: 'Paella Valenciana',
    description: 'Arroz con mariscos y azafrán',
    price: new MoneyVO(16.99),
    imageUrl: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a',
  },
  {
    menuIndex: 2,
    name: 'Moussaka Griega',
    description: 'Capas de berenjena y carne con bechamel',
    price: new MoneyVO(14.99),
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
  },
];
