import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import { join } from 'path';
import * as express from 'express';
import { resolve } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);




  // Increase request body size limit
  app.use(bodyParser.json({ limit: '10mb' })); 
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.enableCors({ 
    origin: '*', 
    credentials: true, 
  });
  
  const sharedFolderPath = resolve(__dirname, '../../shared-folder');
  
  app.use('/shared', express.static(sharedFolderPath));

  
  await app.listen(3001, '192.168.1.141');
  console.log(`🚀 Backend running on 192.168.1.141:3001`);


}
bootstrap();
