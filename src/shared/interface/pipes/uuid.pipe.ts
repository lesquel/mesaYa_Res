import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UUIDPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('Validation failed (uuid is expected)');
    }

    const trimmed = value.trim();
    // Relaxed UUID regex (allows any version)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(trimmed)) {
      throw new BadRequestException('Validation failed (uuid is expected)');
    }

    return trimmed;
  }
}
