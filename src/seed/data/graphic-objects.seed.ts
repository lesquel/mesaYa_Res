export interface GraphicObjectSeedData {
  posX: number;
  posY: number;
  width: number;
  height: number;
  imageIndex: number; // Index to reference the created image
}

export const graphicObjectsSeed: GraphicObjectSeedData[] = [
  {
    posX: 10,
    posY: 10,
    width: 50,
    height: 50,
    imageIndex: 0, // Reference to first image
  },
  {
    posX: 70,
    posY: 10,
    width: 60,
    height: 40,
    imageIndex: 1, // Reference to second image
  },
  {
    posX: 10,
    posY: 70,
    width: 40,
    height: 60,
    imageIndex: 2, // Reference to third image
  },
  {
    posX: 140,
    posY: 10,
    width: 45,
    height: 45,
    imageIndex: 0, // Reference to first image
  },
];
