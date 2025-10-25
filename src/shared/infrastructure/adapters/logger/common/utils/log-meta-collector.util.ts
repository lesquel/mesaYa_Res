import { LOG_META_EXCLUDED_KEYS } from '../constants/log-meta.constants';
import type { BaseLogMeta } from '../types/log.types';

export class LogMetaCollectorUtil {
  static collect(
    info: BaseLogMeta & { [key: string]: unknown },
  ): Record<string, unknown> | undefined {
    const aggregated: Record<string, unknown> =
      info.meta && typeof info.meta === 'object' ? { ...info.meta } : {};

    Object.entries(info).forEach(([key, value]) => {
      if (
        LOG_META_EXCLUDED_KEYS.includes(
          key as (typeof LOG_META_EXCLUDED_KEYS)[number],
        )
      ) {
        return;
      }
      aggregated[key] = value;
    });

    return Object.keys(aggregated).length > 0 ? aggregated : undefined;
  }
}
