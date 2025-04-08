import { Module } from '@nestjs/common';
import { EmotionsController } from './emotions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Emotions, EmotionsSchema } from '../models/emotions.model';
import { EmotionsService } from './emotions.service';
@Module({
  imports: [MongooseModule.forFeature([{ name: Emotions.name, schema: EmotionsSchema }])],
  providers: [EmotionsService],
  controllers: [EmotionsController],
  exports: [EmotionsService],
})
export class EmotionsModule {}
