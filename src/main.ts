import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ 
    origin: '*', 
    credentials: true, 
  });

  await app.listen(3001, '192.168.1.141');
  console.log(`🚀 Backend running on 192.168.1.141:3001`);
}
bootstrap();
