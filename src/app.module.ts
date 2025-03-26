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

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    AuthModule,
    AvatarModule,
    StudioModule,
    AudioModule,
  ],
  controllers: [AvatarController, AudioController, StudioController, AudioController],
})
export class AppModule {}
