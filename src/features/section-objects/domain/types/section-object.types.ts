export type SectionObjectProps = {
  sectionId: string;
  objectId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SectionObjectSnapshot = SectionObjectProps & { id: string };
