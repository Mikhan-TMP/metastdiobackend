import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserAudio, Audio, AudioTitle } from '../models/audio.model';

@Injectable()
export class AudioService {
  constructor(@InjectModel(UserAudio.name) private userAudioModel: Model<UserAudio>) {}

  async addAudio(email: string, title: string, audioDataArray: Audio[]): Promise<UserAudio> {
    let user = await this.userAudioModel.findOne({ email });

    if (!user) {
        // Ensure audios array is initialized
        user = new this.userAudioModel({ email, audios: [] });
        await user.save(); // Ensure document is created first
    }

    // Find the existing title entry
    let titleEntry = user.audios.find((audioTitle) => audioTitle.title === title);

    if (!titleEntry) {
        // Ensure `titleEntry` is an instance of `AudioTitle`
        titleEntry = {
            _id: new Types.ObjectId(),
            title,
            audios: [],
        };

        user.audios.push(titleEntry);
    }

    // Find the updated title entry (since `titleEntry` was just added)
    titleEntry = user.audios.find((audioTitle) => audioTitle.title === title);

    if (titleEntry) {
        // Append new audio data
        titleEntry.audios.push(...audioDataArray);
    }

    // Mark `audios` as modified
    user.markModified('audios');

    return user.save();
}


  async getAllScript(email: string): Promise<{ status: string; message: string; titles: { id: string, title: string }[] }> {
    const result = await this.userAudioModel.findOne({ email });

    return {
      status: result ? 'success' : 'error',
      message: result ? 'Audio list retrieved successfully' : 'No audio list found for this email',
      titles: result ? result.audios.map(title => ({ id: title._id.toString(), title: title.title })) : []
    };
  }
}
