import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AvatarModule } from './avatar/avatar.module';
import { AvatarController } from './avatar/avatar.controller';
import { StudioModule } from './studio/studio.module';
import { AudioController } from './audio/audio.controller';
import { AudioModule } from './audio/audio.module';
import { StudioController } from './studio/studio.controller';
import { AvatarfxModule } from './avatarfx/avatarfx.module';
import { AvatarfxController } from './avatarfx/avatarfx.controller';
import { GesturesModule } from './gestures/gestures.module';
import { GesturesController } from './gestures/gestures.controller';
import { EmotionsModule } from './emotions/emotions.module';
import { AvatarEffectsController } from './avatar-effects/avatar-effects.controller';
import { AvatarEffectsModule } from './avatar-effects/avatar-effects.module';
import { SequencesModule } from './sequences/sequences.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    AuthModule,
    AvatarModule,
    StudioModule,
    AudioModule,
    AvatarfxModule,
    GesturesModule,
    EmotionsModule,
    AvatarEffectsModule,
    SequencesModule,
  ],
  controllers: [AvatarController, AudioController, StudioController, AudioController, AvatarfxController, GesturesController, AvatarEffectsController],
})
export class AppModule {}
