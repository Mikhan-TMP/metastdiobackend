import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Emotions, EmotionsDocument  } from '../models/emotions.model';
import { Model } from 'mongoose';

@Injectable()
export class EmotionsService {
    constructor(
        @InjectModel(Emotions.name) private emotionsModel: Model<EmotionsDocument>,
    ){}

    async getEmotionNames() {
        const emotions = await this.emotionsModel.find().exec();
        emotions.forEach((emotion) => {
            console.log("Emotion Name:", emotion.name);
        });

        return emotions;
    }
}
