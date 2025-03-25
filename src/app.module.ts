import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AvatarModule } from './avatar/avatar.module';
import { AvatarController } from './avatar/avatar.controller';
import { StudioModule } from './studio/studio.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    AuthModule,
    AvatarModule,
    StudioModule,
  ],
  controllers: [AvatarController],
})
export class AppModule {}
