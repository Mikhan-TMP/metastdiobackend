import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { AvatarGen, AvatarGenDocument } from '../models/avatargen.model';

@Injectable()
export class AvatarGenService {
    constructor(
        @InjectModel(AvatarGen.name) private avatarGenModel: Model<AvatarGenDocument>,
        private configService: ConfigService,
    ) {}

    // SAVE THE GENERATED IMG TO THE DATABASE
    async generate(email: string, imgSrc: Buffer, style: string) {
        if (!email) {
            return "Invalid email. Please Sign up first.";
        }
        if (!imgSrc || !(imgSrc instanceof Buffer)) {
            return "Invalid imgSrc. Expected a binary buffer.";
        }
        if (!style) {
            return "Invalid style. Please specify a style.";
        }
        const base64Img = imgSrc.toString('base64');
    
        return await this.avatarGenModel.findOneAndUpdate(
            { email }, 
            { $push: { images: { imgSrc: base64Img, style } } },
            { new: true, upsert: true } 
        );
    }
    // FETCH ALL THE AVATARS
    async getAvatars(email: string) {
        if (!email) {
            return "Invalid email. Please provide a valid email.";
        }
    
        const avatarRecord = await this.avatarGenModel.findOne({ email }).exec();
        if (!avatarRecord) {
            return { message: "No avatars found for this email." };
        }
    
        return avatarRecord.imgSrc;
    }


    
}

