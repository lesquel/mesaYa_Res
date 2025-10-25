import {
  Injectable,
  InternalServerErrorException,
  Logger,
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

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, params.buffer, {
        cacheControl: '3600',
        contentType: params.contentType,
        upsert: false,
      });

    if (error) {
      this.logger.error(
        `Supabase upload failed: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to upload image to storage',
      );
    }

    const { data } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(path, { transform: { width: 0, height: 0 } });

    if (!data?.publicUrl) {
      throw new InternalServerErrorException(
        'Unable to resolve public URL for uploaded file',
      );
    }

    return { path, publicUrl: data.publicUrl };
  }

  async remove(path: string): Promise<void> {
    if (!path) return;
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([path]);
    if (error) {
      this.logger.error(
        `Supabase remove failed: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to remove file from storage',
      );
    }
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
