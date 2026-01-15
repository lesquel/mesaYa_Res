/**
 * Partner Repository Port
 *
 * Defines the contract for partner data persistence.
 */

import type { Partner, PartnerEventType } from '../entities/partner.entity';

export abstract class IPartnerRepositoryPort {
  /**
   * Save a new partner or update existing one
   */
  abstract save(partner: Partner): Promise<Partner>;

  /**
   * Find partner by ID
   */
  abstract findById(id: string): Promise<Partner | null>;

  /**
   * Find partner by name (unique)
   */
  abstract findByName(name: string): Promise<Partner | null>;

  /**
   * Find all partners subscribed to a specific event type
   */
  abstract findBySubscribedEvent(
    eventType: PartnerEventType,
  ): Promise<Partner[]>;

  /**
   * Find all active partners
   */
  abstract findAllActive(): Promise<Partner[]>;

  /**
   * Find all partners
   */
  abstract findAll(): Promise<Partner[]>;

  /**
   * Delete partner by ID
   */
  abstract delete(id: string): Promise<boolean>;

  /**
   * Check if partner name already exists
   */
  abstract existsByName(name: string): Promise<boolean>;
}
