import { Module } from '@nestjs/common';
import { StudioController } from './studio.controller';
import { StudioService } from './studio.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'
import { Studio, StudioSchema } from '../models/studio.model';


@Module({
    imports: [
      MongooseModule.forFeature([{ name: Studio.name, schema: StudioSchema }]),
      ConfigModule.forRoot(),
    ],
  controllers: [StudioController],
  providers: [StudioService],
  exports: [StudioService]
})
export class StudioModule {}
