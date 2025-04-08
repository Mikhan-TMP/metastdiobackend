import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Gesture, GestureDocument } from '../models/gesture.model';
import { Model } from 'mongoose';
@Injectable()
export class GesturesService {

    constructor(
        @InjectModel(Gesture.name) private gestureModel: Model<GestureDocument>,
    ) {}

    async getGestureNames() {
        const gestures = await this.gestureModel.find().exec();        
        gestures.forEach((gesture) => {
            console.log("Gesture Name:", gesture.name);
        });

        return gestures;
    }


}


