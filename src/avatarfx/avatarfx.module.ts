import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AvatarfxService } from './avatarfx.service';
import { AvatarfxController } from './avatarfx.controller';
import { Avatarfx, AvatarfxSchema } from '../models/avatarfx.model';
import { Gesture, GestureSchema } from '../models/gesture.model';
import { GesturesService } from 'src/gestures/gestures.service';
import { EmotionsService } from 'src/emotions/emotions.service';
import { Emotions, EmotionsSchema } from '../models/emotions.model';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Avatarfx.name, schema: AvatarfxSchema }]),
    MongooseModule.forFeature([{ name: Gesture.name, schema: GestureSchema }]),
    MongooseModule.forFeature([{ name: Emotions.name, schema: EmotionsSchema }]),
  ],
  providers: [AvatarfxService, GesturesService, EmotionsService],
  controllers: [AvatarfxController],
  exports: [AvatarfxService, GesturesService, EmotionsService],
})
export class AvatarfxModule {}
