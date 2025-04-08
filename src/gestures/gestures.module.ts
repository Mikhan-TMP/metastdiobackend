import { Module } from '@nestjs/common';
import { GesturesController } from './gestures.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Gesture, GestureSchema } from '../models/gesture.model';
import { GesturesService } from './gestures.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Gesture.name, schema: GestureSchema }])],
  providers: [GesturesService],
  controllers: [GesturesController],
  exports: [GesturesService],
})
export class GesturesModule {}
