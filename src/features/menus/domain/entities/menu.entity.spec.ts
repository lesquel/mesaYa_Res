/**
 * MenuEntity Unit Tests
 */

import { MenuEntity } from './menu.entity';
import { MoneyVO } from '@shared/domain/entities/values';
import type { MenuProps } from '../types';

describe('MenuEntity', () => {
  const createValidProps = (): MenuProps => ({
    restaurantId: 'restaurant-123',
    name: 'Lunch Special',
    description: 'Our daily lunch menu with fresh ingredients',
    price: MoneyVO.create(25.99, 'USD'),
    imageId: 'img-456',
  });

  describe('create', () => {
    it('should create a menu with valid props', () => {
      const menu = MenuEntity.create('menu-1', createValidProps());

      expect(menu.id).toBe('menu-1');
      expect(menu.restaurantId).toBe('restaurant-123');
      expect(menu.name).toBe('Lunch Special');
      expect(menu.description).toBe('Our daily lunch menu with fresh ingredients');
    });

    it('should set price as MoneyVO', () => {
      const menu = MenuEntity.create('menu-2', createValidProps());

      expect(menu.price).toBeInstanceOf(MoneyVO);
      expect(menu.price.amount).toBe(25.99);
      expect(menu.price.currency).toBe('USD');
    });

    it('should set imageId', () => {
      const menu = MenuEntity.create('menu-3', createValidProps());

      expect(menu.imageId).toBe('img-456');
    });

    it('should accept null imageId', () => {
      const props = { ...createValidProps(), imageId: null };
      const menu = MenuEntity.create('menu-4', props);

      expect(menu.imageId).toBeNull();
    });

    it('should throw error for empty name', () => {
      const props = { ...createValidProps(), name: '' };

      expect(() => MenuEntity.create('menu-5', props)).toThrow(
        'Menu must have a valid name',
      );
    });

    it('should throw error for whitespace-only name', () => {
      const props = { ...createValidProps(), name: '   ' };

      expect(() => MenuEntity.create('menu-6', props)).toThrow(
        'Menu must have a valid name',
      );
    });

    it('should throw error for empty description', () => {
      const props = { ...createValidProps(), description: '' };

      expect(() => MenuEntity.create('menu-7', props)).toThrow(
        'Menu must have a valid description',
      );
    });

    it('should throw error for invalid price', () => {
      const props = { ...createValidProps(), price: 'invalid' as any };

      expect(() => MenuEntity.create('menu-8', props)).toThrow(
        'Menu must have a valid price value object',
      );
    });

    it('should throw error for empty restaurantId', () => {
      const props = { ...createValidProps(), restaurantId: '' };

      expect(() => MenuEntity.create('menu-9', props)).toThrow(
        'Menu must reference a valid restaurant',
      );
    });
  });

  describe('update', () => {
    it('should update menu name', () => {
      const menu = MenuEntity.create('menu-10', createValidProps());

      menu.update({ name: 'Dinner Special' });

      expect(menu.name).toBe('Dinner Special');
    });

    it('should update menu description', () => {
      const menu = MenuEntity.create('menu-11', createValidProps());

      menu.update({ description: 'New description' });

      expect(menu.description).toBe('New description');
    });

    it('should update menu price', () => {
      const menu = MenuEntity.create('menu-12', createValidProps());
      const newPrice = MoneyVO.create(35.99, 'EUR');

      menu.update({ price: newPrice });

      expect(menu.price.amount).toBe(35.99);
      expect(menu.price.currency).toBe('EUR');
    });

    it('should update imageId', () => {
      const menu = MenuEntity.create('menu-13', createValidProps());

      menu.update({ imageId: 'new-img-789' });

      expect(menu.imageId).toBe('new-img-789');
    });

    it('should preserve other values when updating', () => {
      const menu = MenuEntity.create('menu-14', createValidProps());
      const originalDescription = menu.description;

      menu.update({ name: 'Updated Name' });

      expect(menu.name).toBe('Updated Name');
      expect(menu.description).toBe(originalDescription);
    });

    it('should throw error when updating to invalid name', () => {
      const menu = MenuEntity.create('menu-15', createValidProps());

      expect(() => menu.update({ name: '' })).toThrow(
        'Menu must have a valid name',
      );
    });
  });

  describe('replaceDishes', () => {
    it('should replace dishes list', () => {
      const menu = MenuEntity.create('menu-16', createValidProps());
      const dishes = [
        { dishId: 'dish-1', name: 'Pasta', price: 12.99, description: 'Italian pasta' },
        { dishId: 'dish-2', name: 'Salad', price: 8.99, description: 'Fresh salad' },
      ];

      menu.replaceDishes(dishes as any);

      expect(menu.dishes).toHaveLength(2);
      expect(menu.dishes?.[0].name).toBe('Pasta');
    });

    it('should clear dishes with empty array', () => {
      const menu = MenuEntity.create('menu-17', createValidProps());
      menu.replaceDishes([{ dishId: 'dish-1', name: 'Test' }] as any);

      menu.replaceDishes([]);

      expect(menu.dishes).toHaveLength(0);
    });
  });

  describe('replaceCategories', () => {
    it('should replace categories list', () => {
      const menu = MenuEntity.create('menu-18', createValidProps());
      const categories = [
        { categoryId: 'cat-1', name: 'Appetizers', sortOrder: 1 },
        { categoryId: 'cat-2', name: 'Main Courses', sortOrder: 2 },
      ];

      menu.replaceCategories(categories as any);

      expect(menu.categories).toHaveLength(2);
      expect(menu.categories?.[0].name).toBe('Appetizers');
    });
  });

  describe('snapshot and rehydrate', () => {
    it('should create a snapshot of the entity', () => {
      const menu = MenuEntity.create('menu-19', createValidProps());
      const snapshot = menu.snapshot();

      expect(snapshot.menuId).toBe('menu-19');
      expect(snapshot.restaurantId).toBe('restaurant-123');
      expect(snapshot.name).toBe('Lunch Special');
    });

    it('should rehydrate entity from snapshot', () => {
      const original = MenuEntity.create('menu-20', createValidProps());
      original.update({ name: 'Updated Menu' });
      const snapshot = original.snapshot();

      const rehydrated = MenuEntity.rehydrate(snapshot);

      expect(rehydrated.id).toBe('menu-20');
      expect(rehydrated.name).toBe('Updated Menu');
    });

    it('should include timestamps in snapshot', () => {
      const menu = MenuEntity.create('menu-21', createValidProps());
      const snapshot = menu.snapshot();

      expect(snapshot.createdAt).toBeInstanceOf(Date);
      expect(snapshot.updatedAt).toBeInstanceOf(Date);
    });
  });
});
