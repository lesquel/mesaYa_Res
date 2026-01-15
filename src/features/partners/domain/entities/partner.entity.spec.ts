/**
 * Partner Entity Unit Tests
 */

import { PartnerEntity } from './partner.entity';

describe('Partner Entity', () => {
  describe('create', () => {
    it('should create a new partner with generated secret', () => {
      const partner = PartnerEntity.create({
        name: 'test-partner',
        webhookUrl: 'https://example.com/webhook',
        events: ['reservation.created', 'payment.completed'],
      });

      expect(partner.id).toBeDefined();
      expect(partner.name).toBe('test-partner');
      expect(partner.webhookUrl).toBe('https://example.com/webhook');
      expect(partner.secret).toBeDefined();
      expect(partner.secret.length).toBeGreaterThan(0);
      expect(partner.status).toBe('ACTIVE');
      expect(partner.events).toEqual([
        'reservation.created',
        'payment.completed',
      ]);
    });
  });

  describe('subscribesToEvent', () => {
    it('should return true for exact event match', () => {
      const partner = PartnerEntity.create({
        name: 'test',
        webhookUrl: 'https://example.com',
        events: ['reservation.created', 'payment.completed'],
      });

      expect(partner.subscribesToEvent('reservation.created')).toBe(true);
      expect(partner.subscribesToEvent('payment.completed')).toBe(true);
    });

    it('should return false for unsubscribed events', () => {
      const partner = PartnerEntity.create({
        name: 'test',
        webhookUrl: 'https://example.com',
        events: ['reservation.created'],
      });

      expect(partner.subscribesToEvent('payment.completed')).toBe(false);
    });

    it('should handle wildcard * subscription', () => {
      const partner = PartnerEntity.create({
        name: 'test',
        webhookUrl: 'https://example.com',
        events: ['*'],
      });

      expect(partner.subscribesToEvent('reservation.created')).toBe(true);
      expect(partner.subscribesToEvent('payment.completed')).toBe(true);
      expect(partner.subscribesToEvent('any.event')).toBe(true);
    });
  });

  describe('regenerateSecret', () => {
    it('should generate a new secret', () => {
      const partner = PartnerEntity.create({
        name: 'test',
        webhookUrl: 'https://example.com',
        events: ['*'],
      });

      const oldSecret = partner.secret;
      const newSecret = partner.regenerateSecret();

      expect(newSecret).not.toBe(oldSecret);
      expect(partner.secret).toBe(newSecret);
    });
  });

  describe('status methods', () => {
    it('should activate partner', () => {
      const partner = PartnerEntity.create({
        name: 'test',
        webhookUrl: 'https://example.com',
        events: ['*'],
      });

      partner.deactivate();
      expect(partner.status).toBe('INACTIVE');

      partner.activate();
      expect(partner.status).toBe('ACTIVE');
    });

    it('should suspend partner', () => {
      const partner = PartnerEntity.create({
        name: 'test',
        webhookUrl: 'https://example.com',
        events: ['*'],
      });

      partner.suspend();
      expect(partner.status).toBe('SUSPENDED');
    });
  });
});
