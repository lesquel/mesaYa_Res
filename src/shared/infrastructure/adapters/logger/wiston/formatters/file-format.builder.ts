import type { Format, TransformableInfo } from 'logform';
import { format } from 'winston';
import { WINSTON_CONSTANTS } from '../constants/winston-logger.constants';
import {
  BaseLogMeta,
  BaseLogPayload,
  LogMetaCollectorUtil,
  LogMetaSanitizerUtil,
} from '../../common';

export class FileFormatBuilder {
  static build(): Format {
    return format.combine(
      format.timestamp({ format: WINSTON_CONSTANTS.TIMESTAMP_FORMAT }),
      format.errors({ stack: true }),
      format.printf(
        (info: TransformableInfo & BaseLogMeta & { stack?: string }) => {
          const rawLevel =
            (info[WINSTON_CONSTANTS.LEVEL_SYMBOL] as string) ??
            info.level ??
            WINSTON_CONSTANTS.DEFAULT_LOG_LEVEL;

          const payload: BaseLogPayload = {
            timestamp: info.timestamp,
            level: rawLevel,
            message: info.message,
          };

          if (info.context) {
            payload.context = info.context;
          }

          const meta = LogMetaCollectorUtil.collect(info);
          if (meta) {
            payload.meta = LogMetaSanitizerUtil.sanitize(meta);
          }

          const trace = info.trace ?? info.stack;
          if (trace) {
            payload.trace = trace;
          }

          return JSON.stringify(payload);
        },
      ),
    );
  }
}
