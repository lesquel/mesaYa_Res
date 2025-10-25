export interface TableSeedData {
  sectionIndex: number;
  number: number;
  capacity: number;
  posX: number;
  posY: number;
  width: number;
  tableImageId: number;
  chairImageId: number;
}

export const tablesSeed: TableSeedData[] = [
  // Tables for Section 0 (Salón Principal)
  {
    sectionIndex: 0,
    number: 1,
    capacity: 4,
    posX: 50,
    posY: 50,
    width: 100,
    tableImageId: 1,
    chairImageId: 2,
  },
  {
    sectionIndex: 0,
    number: 2,
    capacity: 4,
    posX: 200,
    posY: 50,
    width: 100,
    tableImageId: 1,
    chairImageId: 2,
  },
  {
    sectionIndex: 0,
    number: 3,
    capacity: 6,
    posX: 350,
    posY: 50,
    width: 120,
    tableImageId: 1,
    chairImageId: 2,
  },
  {
    sectionIndex: 0,
    number: 4,
    capacity: 2,
    posX: 50,
    posY: 200,
    width: 80,
    tableImageId: 1,
    chairImageId: 2,
  },
  // Tables for Section 1 (Terraza)
  {
    sectionIndex: 1,
    number: 5,
    capacity: 4,
    posX: 50,
    posY: 50,
    width: 100,
    tableImageId: 1,
    chairImageId: 2,
  },
  {
    sectionIndex: 1,
    number: 6,
    capacity: 2,
    posX: 200,
    posY: 50,
    width: 80,
    tableImageId: 1,
    chairImageId: 2,
  },
  // Tables for Section 2 (Salón VIP)
  {
    sectionIndex: 2,
    number: 7,
    capacity: 8,
    posX: 100,
    posY: 100,
    width: 150,
    tableImageId: 1,
    chairImageId: 2,
  },
  {
    sectionIndex: 2,
    number: 8,
    capacity: 6,
    posX: 300,
    posY: 100,
    width: 120,
    tableImageId: 1,
    chairImageId: 2,
  },
  // Tables for Section 3 (Jardín)
  {
    sectionIndex: 3,
    number: 9,
    capacity: 4,
    posX: 50,
    posY: 50,
    width: 100,
    tableImageId: 1,
    chairImageId: 2,
  },
  {
    sectionIndex: 3,
    number: 10,
    capacity: 4,
    posX: 200,
    posY: 50,
    width: 100,
    tableImageId: 1,
    chairImageId: 2,
  },
];
