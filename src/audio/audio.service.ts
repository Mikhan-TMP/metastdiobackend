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
            audios: []
        };

        user.audios.push(titleEntry);
    }

    // Find the updated title entry (since `titleEntry` was just added)
    titleEntry = user.audios.find((audioTitle) => audioTitle.title === title);

    if (titleEntry) {
        // Append new audio data
      const newAudios = audioDataArray.map(audio => ({
        ...audio,
        _id: new Types.ObjectId() // Ensure unique ObjectId for each audio
      }));

      titleEntry.audios.push(...newAudios);
    }

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

  async getScript(email: string, titleId: string): Promise<{ status: string; message: string; audios: Audio[] }> {
    const result = await this.userAudioModel.findOne({ email });
  
    if (!result) {
      return {
        status: 'error',
        message: 'No audio list found for this email',
        audios: []
      };
    }
  
    const titleEntry = result.audios.find(title => title._id.toString() === titleId);
  
    if (!titleEntry) {
      return {
        status: 'error',
        message: 'No audio entry found with the given title ID',
        audios: []
      };
    }
  
    return {
      status: 'success',
      message: 'Audio list retrieved successfully',
      audios: titleEntry.audios
    };
  }
  
  //update audio
  async updateAudio(email: string, titleId: string, audioId: string, updateData: Partial<Audio>): Promise<{ status: string; message: string }> {
    const user = await this.userAudioModel.findOne({ email });
    if (!user) {
      return {
        status: 'error',
        message: 'Invalid Email. Please try again.',
      };
    }
  
    const titleEntry = user.audios.find(title => title._id.toString() === titleId);
    if (!titleEntry) {
      return {
        status: 'error',
        message: 'Invalid titleId. Please try again.',
      };
    }
  
    const audioEntry = titleEntry.audios.find(audio => audio._id.toString() === audioId);
    if (!audioEntry) {
      return {
        status: 'error',
        message: 'Invalid audioId. Please try again.',
      };
    }
  
    // Track if changes are made
    let isUpdated = false;
  
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && (audioEntry as any)[key] !== updateData[key]) {
        (audioEntry as any)[key] = updateData[key];
        isUpdated = true;
      }
    });
  
    if (!isUpdated) {
      return {
        status: 'info',
        message: 'No changes made to the audio.',
      };
    }
  
    user.markModified('audios');
    await user.save();
  
    return {
      status: 'success',
      message: 'Audio updated successfully'
    };
  }

  
  async updateTitle(email: string, titleId: string, newTitle: string): Promise<{ status: string; message: string }> {
    const user = await this.userAudioModel.findOne({ email });
  
    if (!user) {
      return {
        status: 'error',
        message: 'No user found with this email.',
      };
    }
  
    const titleEntry = user.audios.find(title => title._id.toString() === titleId);
    if (!titleEntry) {
      return {
        status: 'error',
        message: 'Invalid titleId. Please try again.',
      };
    }
  
    // Check if the title is actually changing
    if (titleEntry.title === newTitle) {
      return {
        status: 'error',
        message: 'No changes made. The title is already the same.',
      };
    }
  
    // Update the title
    titleEntry.title = newTitle;
  
    user.markModified('audios'); // Ensure MongoDB detects the change
    await user.save();
  
    return {
      status: 'success',
      message: 'Script title updated successfully',
    };
  }


  async deleteAudio(email: string, titleId: string, audioId: string): Promise<{ status: string; message: string }> {
    const user = await this.userAudioModel.findOne({ email });
  
    if (!user) {
      return {
        status: 'error',
        message: 'No user found with this email.',
      };
    }
  
    const titleEntry = user.audios.find(title => title._id.toString() === titleId);
    if (!titleEntry) {
      return {
        status: 'error',
        message: 'Invalid titleId. Please try again.',
      };
    }
  
    const audioEntry = titleEntry.audios.find(audio => audio._id.toString() === audioId);
    if (!audioEntry) {
      return {
        status: 'error',
        message: 'Invalid audioId. Please try again.',
      };
    }
  
    // Remove the audio entry
    titleEntry.audios = titleEntry.audios.filter(audio => audio._id.toString() !== audioId);
  
    user.markModified('audios'); // Ensure MongoDB detects the change
    await user.save();
  
    return {
      status: 'success',
      message: 'Audio deleted successfully',
    }
      
  }

  async deleteScript(email: string, titleId: string): Promise<{ status: string; message: string }> {
    const user = await this.userAudioModel.findOne({ email });
  
    if (!user) {
      return {
        status: 'error',
        message: 'No user found with this email.',
      };
    }
  
    const titleEntry = user.audios.find(title => title._id.toString() === titleId);
    if (!titleEntry) {
      return {
        status: 'error',
        message: 'Invalid titleId. Please try again.',
      };
    }
  
    // Remove the title entry
    user.audios = user.audios.filter(title => title._id.toString() !== titleId);
  
    user.markModified('audios'); // Ensure MongoDB detects the change
    await user.save();
  
    return {
      status: 'success',
      message: 'Script deleted successfully',
    }
  }
  
  
}
