/**
 * Section Entity Unit Tests
 */

import { Section } from './section.entity';

describe('Section', () => {
  const createValidProps = () => ({
    restaurantId: 'restaurant-123',
    name: 'Main Floor',
    description: 'The main dining area',
    width: 100,
    height: 80,
    posX: 0,
    posY: 0,
  });

  describe('create', () => {
    it('should create a section with valid props', () => {
      const section = Section.create(createValidProps());

      expect(section.id).toBeDefined();
      expect(section.restaurantId).toBe('restaurant-123');
      expect(section.name).toBe('Main Floor');
      expect(section.description).toBe('The main dining area');
      expect(section.width).toBe(100);
      expect(section.height).toBe(80);
    });

    it('should create a section with provided id', () => {
      const section = Section.create(createValidProps(), 'custom-id-123');

      expect(section.id).toBe('custom-id-123');
    });

    it('should set default status to ACTIVE', () => {
      const section = Section.create(createValidProps());

      expect(section.status).toBe('ACTIVE');
    });

    it('should set default position to 0,0', () => {
      const props = createValidProps();
      delete (props as any).posX;
      delete (props as any).posY;

      const section = Section.create(props);

      expect(section.posX).toBe(0);
      expect(section.posY).toBe(0);
    });

    it('should set default layout metadata', () => {
      const section = Section.create(createValidProps());

      expect(section.layoutMetadata).toEqual({
        layoutId: null,
        orientation: 'LANDSCAPE',
        zIndex: 0,
        notes: null,
      });
    });

    it('should accept null description', () => {
      const props = { ...createValidProps(), description: null };
      const section = Section.create(props as any);

      expect(section.description).toBeNull();
    });

    it('should throw error for empty name', () => {
      const props = { ...createValidProps(), name: '' };

      expect(() => Section.create(props)).toThrow();
    });

    it('should throw error for empty restaurantId', () => {
      const props = { ...createValidProps(), restaurantId: '' };

      expect(() => Section.create(props)).toThrow();
    });

    it('should throw error for invalid width', () => {
      const props = { ...createValidProps(), width: 0 };

      expect(() => Section.create(props)).toThrow();
    });

    it('should throw error for invalid height', () => {
      const props = { ...createValidProps(), height: -10 };

      expect(() => Section.create(props)).toThrow();
    });
  });

  describe('update', () => {
    it('should update section name', () => {
      const section = Section.create(createValidProps());

      section.update({ name: 'Updated Floor' });

      expect(section.name).toBe('Updated Floor');
    });

    it('should update section description', () => {
      const section = Section.create(createValidProps());

      section.update({ description: 'New description' });

      expect(section.description).toBe('New description');
    });

    it('should update section dimensions', () => {
      const section = Section.create(createValidProps());

      section.update({ width: 200, height: 150 });

      expect(section.width).toBe(200);
      expect(section.height).toBe(150);
    });

    it('should update section position', () => {
      const section = Section.create(createValidProps());

      section.update({ posX: 50, posY: 25 });

      expect(section.posX).toBe(50);
      expect(section.posY).toBe(25);
    });

    it('should update section status', () => {
      const section = Section.create(createValidProps());

      section.update({ status: 'INACTIVE' });

      expect(section.status).toBe('INACTIVE');
    });

    it('should update layout metadata', () => {
      const section = Section.create(createValidProps());

      section.update({
        layoutMetadata: {
          orientation: 'PORTRAIT',
          zIndex: 5,
        },
      });

      expect(section.layoutMetadata.orientation).toBe('PORTRAIT');
      expect(section.layoutMetadata.zIndex).toBe(5);
    });

    it('should preserve existing values when updating partial data', () => {
      const section = Section.create(createValidProps());
      const originalWidth = section.width;

      section.update({ name: 'New Name' });

      expect(section.name).toBe('New Name');
      expect(section.width).toBe(originalWidth);
    });
  });

  describe('snapshot and rehydrate', () => {
    it('should create a snapshot of the entity', () => {
      const section = Section.create(createValidProps(), 'sec-123');
      const snapshot = section.snapshot();

      expect(snapshot.id).toBe('sec-123');
      expect(snapshot.restaurantId).toBe('restaurant-123');
      expect(snapshot.name).toBe('Main Floor');
      expect(snapshot.description).toBe('The main dining area');
      expect(snapshot.width).toBe(100);
      expect(snapshot.height).toBe(80);
      expect(snapshot.status).toBe('ACTIVE');
    });

    it('should rehydrate entity from snapshot', () => {
      const original = Section.create(createValidProps(), 'sec-456');
      original.update({ status: 'INACTIVE' });
      const snapshot = original.snapshot();

      const rehydrated = Section.rehydrate(snapshot);

      expect(rehydrated.id).toBe('sec-456');
      expect(rehydrated.name).toBe('Main Floor');
      expect(rehydrated.status).toBe('INACTIVE');
    });

    it('should preserve layout metadata in snapshot', () => {
      const section = Section.create(createValidProps(), 'sec-789');
      section.update({
        layoutMetadata: {
          orientation: 'PORTRAIT',
          zIndex: 3,
          notes: 'Test notes',
        },
      });
      const snapshot = section.snapshot();

      expect(snapshot.layoutMetadata.orientation).toBe('PORTRAIT');
      expect(snapshot.layoutMetadata.zIndex).toBe(3);
      expect(snapshot.layoutMetadata.notes).toBe('Test notes');
    });

    it('should include timestamps in snapshot', () => {
      const section = Section.create(createValidProps());
      const snapshot = section.snapshot();

      expect(snapshot.createdAt).toBeInstanceOf(Date);
      expect(snapshot.updatedAt).toBeInstanceOf(Date);
    });
  });
});
