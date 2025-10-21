import type { Buffer } from 'node:buffer';

export const IMAGE_STORAGE = Symbol('IMAGE_STORAGE');

export interface ImageStorageUploadParams {
  buffer: Buffer;
  originalName: string;
  contentType: string;
}

export interface ImageStorageUploadResult {
  url: string;
  path: string;
}

export interface ImageStoragePort {
  upload(params: ImageStorageUploadParams): Promise<ImageStorageUploadResult>;
  remove(path: string): Promise<void>;
}
