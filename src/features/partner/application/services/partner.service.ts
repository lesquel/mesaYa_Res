/**
 * Partner Service
 *
 * Application service for managing B2B partners.
 * Handles registration, updates, and partner lifecycle.
 */

import { Injectable, Logger, ConflictException } from '@nestjs/common';
import {
  Partner,
  PartnerEventType,
  IPartnerRepositoryPort,
} from '../../domain';
import { HmacService } from './hmac.service';

export interface RegisterPartnerDto {
  name: string;
  webhookUrl: string;
  subscribedEvents: PartnerEventType[];
  description?: string;
  contactEmail?: string;
}

export interface UpdatePartnerDto {
  webhookUrl?: string;
  subscribedEvents?: PartnerEventType[];
  description?: string;
  contactEmail?: string;
}

export interface PartnerRegistrationResult {
  partner: Partner;
  secret: string; // Only returned once at registration
}

@Injectable()
export class PartnerService {
  private readonly logger = new Logger(PartnerService.name);

  constructor(
    private readonly partnerRepository: IPartnerRepositoryPort,
    private readonly hmacService: HmacService,
  ) {}

  /**
   * Register a new partner
   *
   * Generates a unique secret for HMAC signing.
   * The secret is only returned once and should be stored securely by the partner.
   */
  async registerPartner(
    dto: RegisterPartnerDto,
  ): Promise<PartnerRegistrationResult> {
    this.logger.log(`Registering new partner: ${dto.name}`);

    // Check if partner name already exists
    const exists = await this.partnerRepository.existsByName(dto.name);
    if (exists) {
      throw new ConflictException(
        `Partner with name '${dto.name}' already exists`,
      );
    }

    // Generate unique secret for this partner
    const secret = this.hmacService.generateSecret();

    // Create partner entity
    const partner = new Partner({
      name: dto.name,
      webhookUrl: dto.webhookUrl,
      secret,
      subscribedEvents: dto.subscribedEvents,
      description: dto.description,
      contactEmail: dto.contactEmail,
    });

    // Save to repository
    const savedPartner = await this.partnerRepository.save(partner);

    this.logger.log(`Partner registered successfully: ${savedPartner.id}`);

    return {
      partner: savedPartner,
      secret, // Return secret only at registration
    };
  }

  /**
   * Get partner by ID
   */
  async getPartnerById(id: string): Promise<Partner | null> {
    return this.partnerRepository.findById(id);
  }

  /**
   * Get all partners
   */
  async getAllPartners(): Promise<Partner[]> {
    return this.partnerRepository.findAll();
  }

  /**
   * Get all active partners
   */
  async getActivePartners(): Promise<Partner[]> {
    return this.partnerRepository.findAllActive();
  }

  /**
   * Get partners subscribed to a specific event
   */
  async getPartnersForEvent(eventType: PartnerEventType): Promise<Partner[]> {
    return this.partnerRepository.findBySubscribedEvent(eventType);
  }

  /**
   * Update partner details
   */
  async updatePartner(id: string, dto: UpdatePartnerDto): Promise<Partner> {
    const partner = await this.partnerRepository.findById(id);

    if (!partner) {
      throw new Error(`Partner not found: ${id}`);
    }

    if (dto.webhookUrl) {
      partner.updateWebhookUrl(dto.webhookUrl);
    }

    if (dto.subscribedEvents) {
      partner.updateSubscribedEvents(dto.subscribedEvents);
    }

    return this.partnerRepository.save(partner);
  }

  /**
   * Activate a partner
   */
  async activatePartner(id: string): Promise<Partner> {
    const partner = await this.partnerRepository.findById(id);

    if (!partner) {
      throw new Error(`Partner not found: ${id}`);
    }

    partner.activate();
    return this.partnerRepository.save(partner);
  }

  /**
   * Deactivate a partner
   */
  async deactivatePartner(id: string): Promise<Partner> {
    const partner = await this.partnerRepository.findById(id);

    if (!partner) {
      throw new Error(`Partner not found: ${id}`);
    }

    partner.deactivate();
    return this.partnerRepository.save(partner);
  }

  /**
   * Delete a partner
   */
  async deletePartner(id: string): Promise<boolean> {
    this.logger.log(`Deleting partner: ${id}`);
    return this.partnerRepository.delete(id);
  }

  /**
   * Regenerate secret for a partner
   *
   * Use with caution - the old secret will no longer work.
   */
  async regenerateSecret(id: string): Promise<string> {
    const partner = await this.partnerRepository.findById(id);

    if (!partner) {
      throw new Error(`Partner not found: ${id}`);
    }

    // We need to create a new partner with new secret since secret is readonly
    const newSecret = this.hmacService.generateSecret();

    const newPartner = new Partner({
      id: partner.id,
      name: partner.name,
      webhookUrl: partner.webhookUrl,
      secret: newSecret,
      subscribedEvents: partner.subscribedEvents,
      status: partner.status,
      description: partner.description,
      contactEmail: partner.contactEmail,
      createdAt: partner.createdAt,
      lastWebhookAt: partner.lastWebhookAt,
      failedWebhookCount: partner.failedWebhookCount,
    });

    await this.partnerRepository.save(newPartner);

    this.logger.log(`Secret regenerated for partner: ${id}`);
    return newSecret;
  }
}
