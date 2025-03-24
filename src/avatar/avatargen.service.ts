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

    async generate(email: string, imgSrc: Buffer) {
        if (!email) {
            return "Invalid email. Please Sign up first.";
        }
        if (!imgSrc || !(imgSrc instanceof Buffer)) {
            return "Invalid imgSrc. Expected a binary buffer.";
        }
        const base64Img = imgSrc.toString('base64');

        const avatarGen = new this.avatarGenModel({ email, imgSrc: base64Img });
        return avatarGen.save();
    }
}

