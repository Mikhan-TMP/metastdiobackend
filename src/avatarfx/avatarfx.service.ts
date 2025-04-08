import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Avatarfx, AvatarfxDocument } from '../models/avatarfx.model';
import { v4 as uuidv4 } from 'uuid';
import { GesturesService } from 'src/gestures/gestures.service';
import { Gesture, GestureDocument } from '../models/gesture.model'; 
import { Emotions, EmotionsDocument } from '../models/emotions.model'; // Adjust the import path as necessary


@Injectable()
export class AvatarfxService {
    constructor(
        @InjectModel(Avatarfx.name) 
        private avatarfxModel: Model<AvatarfxDocument>,
        private readonly gesturesService: GesturesService,
        @InjectModel(Gesture.name)
        private gestureModel: Model<GestureDocument>, 
        @InjectModel(Emotions.name)
        private emotionsModel: Model<EmotionsDocument>, 
    ) {}


    async initializeAvatarFx(email: string, avatarID: string, cameraViews: any) {
        try {
            const gestures = await this.gestureModel.find().exec();
            const emotions = await this.emotionsModel.find().exec();
        
            const newAvatar = {
            _id: new Types.ObjectId(),
            avatarID,
            front: {
                id: cameraViews.front?.id || uuidv4(),
                src: '',
                is_selected: false,
            },
            side: {
                id: cameraViews.side?.id || uuidv4(),
                src: '',
                is_selected: false,
            },
            back: {
                id: cameraViews.back?.id || uuidv4(),
                src: '',
                is_selected: false,
            },
            close_up: {
                id: cameraViews.close_up?.id || uuidv4(),
                src: '',
                is_selected: false,
            },
            gestures: gestures.map((gesture) => ({
                id: uuidv4(),
                name: gesture.name,
                src: '',
                is_selected: false,
            })),
            emotions: emotions.map((emotion) => ({
                id: uuidv4(),
                name: emotion.name,
                src: '',
                is_selected: false,
            })),
            };
        
            const existingAvatarfx = await this.avatarfxModel.findOne({ email });
        
            if (existingAvatarfx) {
            const existingAvatarIndex = existingAvatarfx.avatars.findIndex(
                (avatar) => avatar.avatarID === avatarID,
            );
        
            if (existingAvatarIndex !== -1) {
                existingAvatarfx.avatars[existingAvatarIndex] = {
                ...existingAvatarfx.avatars[existingAvatarIndex],
                ...newAvatar,
                };
            } else {
                existingAvatarfx.avatars.push(newAvatar);
            }
        
            await existingAvatarfx.save();
            } else {
            const newAvatarfx = new this.avatarfxModel({
                email,
                avatars: [newAvatar],
            });
        
            await newAvatarfx.save();
            }
        
            return {
            status: 'success',
            message: 'Avatar added/updated successfully.',
            };
        } catch (error) {
            console.error('[generateAvatarFx] Error:', error);
        
            return {
            status: 'error',
            message: 'Something went wrong while adding/updating avatar.',
            error: error.message || error,
            };
        }
        }
        

    
}
