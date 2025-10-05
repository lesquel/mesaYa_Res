export const OWNER_READER = Symbol('OWNER_READER');

export interface OwnerReaderPort {
  exists(ownerId: string): Promise<boolean>;
}
