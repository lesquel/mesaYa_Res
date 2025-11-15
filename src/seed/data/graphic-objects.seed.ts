import { imagesSeed } from './images.seed';

export interface GraphicObjectSeedData {
  posX: number;
  posY: number;
  width: number;
  height: number;
  imageIndex: number;
}

export const graphicObjectsSeed: GraphicObjectSeedData[] = Array.from(
  { length: 12 },
  (_, index) => ({
    posX: (index % 4) * 60 + 10,
    posY: Math.floor(index / 4) * 70 + 10,
    width: 40 + (index % 3) * 10,
    height: 40 + ((index + 1) % 3) * 12,
    imageIndex: index % imagesSeed.length,
  }),
);
