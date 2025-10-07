import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as YAML from 'yaml';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService,
) {
  const API_TITLE = configService.get<string>('APP_TITLE') ?? 'API';
  const API_DESCRIPTION =
    configService.get<string>('APP_DESCRIPTION') ?? 'API documentation';
  const API_VERSION = configService.get<string>('APP_VERSION') ?? '1.0.0';

  const config = new DocumentBuilder()
    .setTitle(API_TITLE)
    .setDescription(API_DESCRIPTION)
    .setVersion(API_VERSION)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const yamlDocument = YAML.stringify(document);

  const outputDir = './docs/swagger';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(`${outputDir}/swagger.yml`, yamlDocument);
  fs.writeFileSync(
    `${outputDir}/swagger.json`,
    JSON.stringify(document, null, 2),
  );
  SwaggerModule.setup('docs/api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
