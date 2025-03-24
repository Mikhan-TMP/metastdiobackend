import { Module } from '@nestjs/common';
import  {AvatarController } from './avatar.controller';
import { AvatarGenService } from './avatargen.service';
import { AvatarGen, AvatarGenSchema } from '../models/avatargen.model';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AvatarGen.name, schema: AvatarGenSchema }]),
    ConfigModule.forRoot(),
  ],
  controllers: [AvatarController],
  providers: [AvatarGenService],
  exports: [AvatarGenService],
})
export class AvatarModule {}
