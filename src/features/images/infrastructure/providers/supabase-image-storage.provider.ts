import { Injectable } from '@nestjs/common';
import { SupabaseStorageService } from '@shared/infrastructure/supabase/index';
import {
  type ImageStoragePort,
  type ImageStorageUploadParams,
  type ImageStorageUploadResult,
} from '../../application/ports/index';

@Injectable()
export class SupabaseImageStorageProvider implements ImageStoragePort {
  constructor(private readonly supabase: SupabaseStorageService) {}

  async upload(
    params: ImageStorageUploadParams,
  ): Promise<ImageStorageUploadResult> {
    const { path, publicUrl } = await this.supabase.uploadPublic({
      buffer: params.buffer,
      contentType: params.contentType,
      originalName: params.originalName,
      prefix: 'images',
    });

    return { path, url: publicUrl };
  }

  async remove(path: string): Promise<void> {
    await this.supabase.remove(path);
  }
}
