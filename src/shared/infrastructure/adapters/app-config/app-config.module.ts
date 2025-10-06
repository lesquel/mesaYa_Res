import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envConfig } from '@shared/core/config/env.config';
import { JoiValidationSchema } from '@shared/core/config/joi.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfig],
      isGlobal: true,
      validationSchema: JoiValidationSchema,
    }),
  ],
})
export class AppConfigModule {}
