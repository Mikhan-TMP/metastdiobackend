import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AvatarEffectsService } from './avatar-effects.service';
import { AvatarEffects, AvatarEffectsSchema } from '../models/avatarEffects.model';
import { AvatarEffectsController } from './avatar-effects.controller';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AvatarEffects.name, schema: AvatarEffectsSchema},
    ]),
    ConfigModule.forRoot(),
  ],
  controllers: [AvatarEffectsController],
  providers: [AvatarEffectsService],
  exports: [AvatarEffectsService],
})
export class AvatarEffectsModule {}
