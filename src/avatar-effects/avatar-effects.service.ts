import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as path from 'path';
import * as fs from 'fs-extra';
import { AvatarEffects, AvatarEffectsDocument } from '../models/avatarEffects.model';

@Injectable()
export class AvatarEffectsService {
constructor(
    @InjectModel(AvatarEffects.name)
    private avatarEffectsModel: Model<AvatarEffectsDocument>,
) {}

    async saveEffects(body: any, files: Express.Multer.File[]): Promise<AvatarEffects> {
        const rootFolder = process.env.AVATARFX_FOLDER || 'shared-folder/avatarfx';
        const email = body.email.replace(/[^a-zA-Z0-9]/g, '_');
        const name = body.name;
        const avatarId = body.avatarId;

        // Create a unique subfolder for each user based on email, name, and avatarId
        const basePath = path.join(rootFolder, email, `${name}_${avatarId}`);
        
        // Parse gestures and emotions payload
        const gesturesPayload = JSON.parse(body.gestures || '[]');
        const emotionsPayload = JSON.parse(body.emotions || '[]');

        const processCategory = async (category, payloads) => {
            const result: any[] = [];

            for (const item of payloads) {
                // Create subfolder for each gesture/emotion item
                const subfolder = path.join(basePath, category, item.name);
                await fs.ensureDir(subfolder);

                const fileFields = ['baseImg', 'front', 'back', 'side', 'close_up'];
                const processed = { ...item };

                for (const field of fileFields) {
                    const file = files.find(f => f.fieldname === `${category}_${item.name}_${field}`);
                    if (file) {
                        const ext = path.extname(file.originalname);
                        const filename = `${item.name}_${field}${ext}`;
                        const filepath = path.join(subfolder, filename);
                        const fileURL = '/shared/avatarfx/' + email + '/' + name + '_' + avatarId + '/' + category + '/' + item.name + '/' + filename;

                        await fs.writeFile(filepath, file.buffer);
                        processed[field] = fileURL; // Save the URL for the file

                        // processed[field] = filepath; // Save the file path
                    }
                }

                result.push(processed); // Add processed gesture/emotion to result
            }

            return result;
        };

        // Process gestures and emotions
        const gestures = await processCategory('gestures', gesturesPayload);
        const emotions = await processCategory('emotions', emotionsPayload);

        // Create and save the new entry to the database
        const newEntry = new this.avatarEffectsModel({
            
            email: body.email,
            name: body.name,
            avatarId: body.avatarId,
            Gestures: gestures,
            Emotions: emotions,
        });

        return newEntry.save();
    }

    async getAllEffects(email: string, avatarId: string): Promise<AvatarEffects[]> {
        // Sanitize email
        const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
        if (!email || !avatarId) {
            throw new Error('Email and Avatar ID are required');
        }
    
        // Find the effects entry in the database
        const effects = await this.avatarEffectsModel.find({
            email: email,
            avatarId: avatarId,
        }).lean();
    
        return effects;
    }

    

}
