import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as YAML from 'yaml';
import * as fs from 'fs';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('MesaYa API REST')
    .setDescription('API para la gestión de reservas y restaurantes')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Users', 'Operaciones relacionadas con usuarios')
    .addTag('Restaurants', 'Gestión de restaurantes')
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
