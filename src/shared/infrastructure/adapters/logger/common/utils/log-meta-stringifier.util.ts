import { inspect } from 'node:util';
import { LogMetaSanitizerUtil } from './log-meta-sanitizer.util';

export class LogMetaStringifierUtil {
  static stringify(meta?: Record<string, unknown>): string | null {
    if (!meta || Object.keys(meta).length === 0) {
      return null;
    }

    const sanitized = LogMetaSanitizerUtil.sanitize(meta);

    try {
      return JSON.stringify(sanitized, null, 2);
    } catch {
      return inspect(sanitized, { depth: null, colors: false, compact: false });
    }
  }
}
