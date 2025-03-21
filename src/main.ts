import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ 
    origin: '*', // Allow frontend
    credentials: true, // Allow cookies
  });

  await app.listen(4000);
  console.log(`🚀 Backend running on http://localhost:4000`);
}
bootstrap();
