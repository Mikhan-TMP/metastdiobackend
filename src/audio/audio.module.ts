import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';
import { Audio, AudioSchema, UserAudio, UserAudioSchema } from '../models/audio.model';

@Module({    
    imports: [
        MongooseModule.forFeature([
            { name: Audio.name, schema: AudioSchema },
            { name: UserAudio.name, schema: UserAudioSchema } // Ensure UserAudio is registered
        ]),
        ConfigModule.forRoot(),
    ],
    controllers: [AudioController],
    providers: [AudioService],
    exports: [AudioService]
})
export class AudioModule {}
