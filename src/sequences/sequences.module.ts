import { Module } from '@nestjs/common';
import { SequencesService } from './sequences.service';
import { SequencesController } from './sequences.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sequences, SequencesSchema } from '../models/sequences.model';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sequences.name, schema: SequencesSchema },
    ]),
    ConfigModule.forRoot(),
  ],
  providers: [SequencesService],
  controllers: [SequencesController],
  exports: [SequencesService],
})
export class SequencesModule {}
