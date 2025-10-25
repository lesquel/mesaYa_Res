import type { Format, TransformableInfo } from 'logform';
import { format } from 'winston';
import { WINSTON_CONSTANTS } from '../constants/winston-logger.constants';
import {
  BaseLogMeta,
  LogMetaCollectorUtil,
  LogMetaStringifierUtil,
  LogSectionFormatterUtil,
} from '../../common';

export class ConsoleFormatBuilder {
  static build(): Format {
    const colorizer = format.colorize();

    return format.combine(
      format.timestamp({ format: WINSTON_CONSTANTS.TIMESTAMP_FORMAT }),
      format.errors({ stack: true }),
      format.printf(
        (info: TransformableInfo & BaseLogMeta & { stack?: string }) => {
          const rawLevel =
            (info[WINSTON_CONSTANTS.LEVEL_SYMBOL] as string) ?? info.level;

          // Colorear solo el nivel
          const levelColored = colorizer.colorize(
            rawLevel,
            rawLevel.toUpperCase(),
          );

          // Opcional: colorear el contexto (cyan)
          const contextColored = info.context
            ? `[\x1b[36m${info.context}\x1b[0m]`
            : '';

          // Construir la línea principal
          const primaryLine =
            `${info.timestamp} [${levelColored}] ${contextColored} - ${info.message}`.trim();

          // Secciones meta y trace
          const metaSection = LogSectionFormatterUtil.format(
            'meta',
            LogMetaStringifierUtil.stringify(
              LogMetaCollectorUtil.collect(info),
            ),
          );
          const traceSource = info.trace ?? info.stack;
          const traceSection = LogSectionFormatterUtil.format(
            'trace',
            traceSource ?? null,
          );

          return [primaryLine, metaSection, traceSection]
            .filter(Boolean)
            .join('\n');
        },
      ),
    );
  }
}
