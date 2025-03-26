import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAudio, Audio } from '../models/audio.model';

@Injectable()
export class AudioService {
  constructor(@InjectModel(UserAudio.name) private userAudioModel: Model<UserAudio>) {}

    async addAudio(email: string, title: string, audioDataArray: Audio[]): Promise<UserAudio> {
        let user = await this.userAudioModel.findOne({ email });

        if (!user) {
            user = new this.userAudioModel({ email, audios: {} });
        }

        // Ensure title category exists
        if (!user.audios[title]) {
            user.audios[title] = [];
        }

        // Append new audio data
        user.audios[title] = [...user.audios[title], ...audioDataArray];

        // Mark `audios` as modified
        user.markModified('audios');

        return user.save();
    }



}
