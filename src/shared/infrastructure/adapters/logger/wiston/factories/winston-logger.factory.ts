import { createLogger, transports, Logger } from 'winston';
import { WINSTON_CONSTANTS } from '../constants/winston-logger.constants';
import { ConsoleFormatBuilder } from '../formatters/console-format.builder';
import { FileFormatBuilder } from '../formatters/file-format.builder';

export class WinstonLoggerFactory {
  static create(): Logger {
    return createLogger({
      level: WINSTON_CONSTANTS.DEFAULT_LOG_LEVEL,
      transports: [
        new transports.Console({
          format: ConsoleFormatBuilder.build(),
        }),
        new transports.File({
          filename: WINSTON_CONSTANTS.ERROR_LOG_FILE,
          level: 'error',
          format: FileFormatBuilder.build(),
        }),
        new transports.File({
          filename: WINSTON_CONSTANTS.COMBINED_LOG_FILE,
          format: FileFormatBuilder.build(),
        }),
      ],
    });
  }
}
