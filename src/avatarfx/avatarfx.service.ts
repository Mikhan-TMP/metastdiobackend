import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Avatarfx, AvatarfxDocument } from '../models/avatarfx.model';
import { v4 as uuidv4 } from 'uuid';
import { GesturesService } from 'src/gestures/gestures.service';
import { Gesture, GestureDocument } from '../models/gesture.model';
import { Emotions, EmotionsDocument } from '../models/emotions.model';
import * as fs from 'fs';
import * as path from 'path';

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

    private async saveImage(base64: string, filepath: string): Promise<string> {
        const buffer = Buffer.from(base64, 'base64');
        await fs.promises.mkdir(path.dirname(filepath), { recursive: true });
        await fs.promises.writeFile(filepath, buffer);
        return filepath;
    }

    async initializeAvatarFx(email: string, avatarID: string, cameraViews: any) {
        try {
            const folderName = `${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const fxBaseFolder = process.env.AVATARFX_FOLDER || 'shared-folder/avatarfx';
            const userFolderPath = path.join(fxBaseFolder, folderName);
            
            // Add avatarID to the path to separate folders for each avatar
            const avatarFolderPath = path.join(userFolderPath, avatarID);
            
            // Create the avatar directory if it doesn't exist
            await fs.promises.mkdir(avatarFolderPath, { recursive: true });
    
            const newAvatarID = new Types.ObjectId();
            const cameraViewFields = ['front', 'side', 'back', 'close_up'];
    
            const cameraViewData = await Promise.all(
            cameraViewFields.map(async (view) => {
                const id = cameraViews[view]?.id || uuidv4();
                let src = '';
                if (cameraViews[view]?.base64) {
                    const base64Data = cameraViews[view].base64.replace(/^data:image\/png;base64,/, '');
                    const filename = `${view}.png`;
                    const filepath = path.join(avatarFolderPath, filename);
                    const url = '/shared/avatarfx/' + folderName + '/' + avatarID + '/' + filename;
                    console.log(filepath);
                    await this.saveImage(base64Data, filepath);
                    src = url;
                }
    
                return {
                id,
                src,
                is_selected: false,
                };
            }),
            );
    
            const newAvatar = {
                _id: newAvatarID,
                avatarID,
                front: cameraViewData[0],
                side: cameraViewData[1],
                back: cameraViewData[2],
                close_up: cameraViewData[3],
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
            console.error('[initializeAvatarFx] Error:', error);
    
            return {
                status: 'error',
                message: 'Something went wrong while adding/updating avatar.',
                error: error.message || error,
            };
        }
    }

    async getBaseCameraViews(email: string, avatarID: string) {
        try {
            const avatarfx = await this.avatarfxModel.findOne({ email });
    
            if (!avatarfx) {
                return {
                    status: 'error',
                    message: 'No avatarfx data found for the provided email.',
                };
            }
    
            const avatar = avatarfx.avatars.find((a) => a.avatarID === avatarID);
    
            if (!avatar) {
                return {
                    status: 'error',
                    message: 'Avatar with the specified ID not found.',
                };
            }
    
            // Helper to normalize paths (for Windows compatibility in web apps)
            const normalizePath = (src: string) => src?.replace(/\\/g, '/');
    
            // Extract and normalize camera views
            const cameraViews = {
                front: {
                    ...avatar.front,
                    src: normalizePath(avatar.front?.src),
                },
                side: {
                    ...avatar.side,
                    src: normalizePath(avatar.side?.src),
                },
                back: {
                    ...avatar.back,
                    src: normalizePath(avatar.back?.src),
                },
                close_up: {
                    ...avatar.close_up,
                    src: normalizePath(avatar.close_up?.src),
                },
            };
    
            return {
                status: 'success',
                cameraViews,
            };
        } catch (error) {
            console.error('[getBaseCameraViews] Error:', error);
            return {
                status: 'error',
                message: 'Something went wrong while fetching camera views.',
                error: error.message || error,
            };
        }
    }
    
    
}
