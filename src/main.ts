/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { getEnvConfig } from './shared/utils/config';

config({ path: getEnvConfig() });
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // origin: 'http://localhost:5173',
    origin: '*',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
