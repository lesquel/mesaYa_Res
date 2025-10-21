export abstract class ISectionObjectObjectReaderPort {
  abstract exists(objectId: string): Promise<boolean>;
}
