import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

const FILENAME_SAFE_REGEX = /[^a-zA-Z0-9-_\.]/g;

export interface UploadParams {
  buffer: Buffer;
  originalName: string;
  contentType: string;
  prefix?: string;
}

export interface UploadResult {
  path: string;
  publicUrl: string;
}

@Injectable()
export class SupabaseStorageService {
  private readonly client: SupabaseClient;
  private readonly bucket: string;
  private readonly logger = new Logger(SupabaseStorageService.name);
  private failureCount = 0;
  private circuitOpenUntil = 0;
  private readonly circuitThreshold = 3;
  private readonly circuitCooldownMs = 30_000;

  constructor(private readonly config: ConfigService) {
    const url = this.configOrThrow('SUPABASE_URL');
    const serviceKey = this.configOrThrow('SUPABASE_SERVICE_KEY');
    this.bucket = this.configOrThrow('SUPABASE_BUCKET');

    this.client = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  async uploadPublic(params: UploadParams): Promise<UploadResult> {
    const normalizedName = this.normalizeFilename(params.originalName);
    const keyPrefix = params.prefix ?? 'images';
    const path = `${keyPrefix}/${randomUUID()}${extname(normalizedName)}`;

    const uploadAttempt = async () =>
      this.client.storage.from(this.bucket).upload(path, params.buffer, {
        cacheControl: '3600',
        contentType: params.contentType,
        upsert: false,
      });

    const { error } = await this.withRetries(uploadAttempt, 3, 250);

    if (error) {
      this.logger.error(`Supabase upload failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload image to storage');
    }

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(path, {
      transform: { width: 0, height: 0 },
    });

    if (!data?.publicUrl) {
      this.logger.error('Supabase public URL not available after upload', path);
      throw new InternalServerErrorException('Unable to resolve public URL for uploaded file');
    }

    return { path, publicUrl: data.publicUrl };
  }

  async remove(path: string): Promise<void> {
    if (!path) return;
    const removeAttempt = async () => this.client.storage.from(this.bucket).remove([path]);
    const { error } = await this.withRetries(removeAttempt, 2, 200);
    if (error) {
      this.logger.error(`Supabase remove failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to remove file from storage');
    }
  }

  private async withRetries<T>(
    fn: () => Promise<T>,
    attempts = 3,
    baseDelayMs = 200,
  ): Promise<T> {
    if (this.isCircuitOpen()) {
      throw new ServiceUnavailableException(
        'Supabase storage temporarily unavailable',
      );
    }
    let lastError: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        const value = await fn();
        this.resetCircuit();
        return value;
      } catch (err: unknown) {
        lastError = err;
        const isTransient = this.isTransientError(err);
        this.logger.warn(
          `Supabase call failed (attempt ${i + 1}/${attempts}) - transient=${isTransient}: ${
            (err as Error)?.message ?? String(err)
          }`,
        );
        if (!isTransient) {
          this.resetCircuit();
          break;
        }
        this.failureCount++;
        if (this.failureCount >= this.circuitThreshold) {
          this.openCircuit();
          throw new ServiceUnavailableException(
            'Supabase storage temporarily unavailable',
          );
        }
        const delay = baseDelayMs * Math.pow(2, i);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
    throw lastError;
  }

  private isCircuitOpen(): boolean {
    if (Date.now() <= this.circuitOpenUntil) {
      return true;
    }
    if (this.circuitOpenUntil) {
      this.resetCircuit();
    }
    return false;
  }

  private openCircuit(): void {
    this.circuitOpenUntil = Date.now() + this.circuitCooldownMs;
    this.logger.warn('Supabase circuit opened for storage service.');
  }

  private resetCircuit(): void {
    this.failureCount = 0;
    this.circuitOpenUntil = 0;
  }

  private isTransientError(err: unknown): boolean {
    if (!err) return false;
    const e = err as any;
    // DNS lookup or network errors
    if (e?.code === 'EAI_AGAIN') return true;
    if (typeof e?.message === 'string' && e.message.includes('getaddrinfo')) return true;
    if (typeof e?.name === 'string' && /fetch|network/i.test(e.name)) return true;
    return false;
  }

  private configOrThrow(key: string): string {
    const value = this.config.get<string>(key);
    if (!value)
      throw new InternalServerErrorException(
        `Missing configuration for ${key}`,
      );
    return value;
  }

  private normalizeFilename(originalName: string): string {
    const base = originalName?.trim() || 'file';
    const sanitized = base.replace(FILENAME_SAFE_REGEX, '-');
    return sanitized.slice(-200);
  }
}
