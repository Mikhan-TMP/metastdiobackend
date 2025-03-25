import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { AvatarGen, AvatarGenDocument } from '../models/avatargen.model';

@Injectable()
export class AvatarGenService {
    constructor(
        @InjectModel(AvatarGen.name) private avatarGenModel: Model<AvatarGenDocument>,
        private configService: ConfigService,
    ) {}

    // SAVE THE GENERATED IMG TO THE DATABASE
    async generate(email: string, imgSrc: Buffer, style: string, name: string) {
        if (!email) {
            return { message: "Invalid email. Please Sign up first.", status: "error" };
        }
        if (!imgSrc || !(imgSrc instanceof Buffer)) {
            return { message: "Invalid imgSrc. Expected a binary buffer.", status: "error" };
        }
        if (!style) {
            return { message: "Invalid style. Please specify a style.", status: "error" };
        }

        const base64Img = imgSrc.toString('base64');
    
        return await this.avatarGenModel.findOneAndUpdate(
            { email }, 
            { $push: { avatars: { name, imgSrc: base64Img, style } } }, 
            { new: true, upsert: true }
        );
        
    }

    async getAvatars(email: string, style?: string, name?: string) {
        const query: any = { email };
    
        if (style || name) {
            query.avatars = { $elemMatch: {} };
    
            if (style) {
                query.avatars.$elemMatch.style = style.trim();
            }
    
            if (name) {
                query.avatars.$elemMatch.name = { $regex: name.trim(), $options: "i" }; // Case-insensitive search
            }
        }
    
        const avatarRecords = await this.avatarGenModel.find(query).exec();
        
        if (!avatarRecords.length) {
            return { status: "error", message: "No avatars found for this email with the specified filters." };
        }
    
        // Extract and return only matching images
        const avatars = avatarRecords.flatMap(record => 
            record.avatars.filter(img => 
                (!style || img.style === style.trim()) && 
                (!name || new RegExp(name.trim(), "i").test(img.name)) // Case-insensitive check
            )
        );
    
        return avatars.map(img => ({
            imgSrc: img.imgSrc,
            style: img.style,
            name: img.name,
            id: img._id
        }));
    }

    async deleteAvatar(email: string, id: string) {
        if (!email || !id) {
            return { status: "error", message: "Email and avatar ID are required to delete an avatar." };
        }
    
        // Convert id to ObjectId
        const objectId = new Types.ObjectId(id);
    
        const result = await this.avatarGenModel.findOneAndUpdate(
            { email, "avatars._id": objectId }, // Find the document where the avatar exists
            { $pull: { avatars: { _id: objectId } } }, // Remove the specific avatar
            { new: true }
        );
    
        if (!result) {
            return { status: "error", message: "No matching avatar found to delete." };
        }
    
        // Check if the avatar still exists
        const deleted = !result.avatars.some(avatar => avatar._id.toString() === id);
        if (!deleted) {
            return { status: "error", message: "No matching avatar found to delete." };
        }
    
        return { status: "success", message: "Avatar deleted successfully." };
    }

    async updateAvatar(id: string, email: string, name: string) {
        if (!email || !id || !name) {
            return { status: "error", message: "Email, avatar ID, and new name are required to update an avatar." };
        }
    
        // Validate if `id` is a valid ObjectId
        if (!Types.ObjectId.isValid(id)) {
            return { status: "error", message: "Invalid avatar ID format." };
        }
    
        // Convert id to ObjectId
        const objectId = new Types.ObjectId(id);
    
        const result = await this.avatarGenModel.findOneAndUpdate(
            { email, "avatars._id": objectId }, 
            { $set: { "avatars.$.name": name } }, 
            { new: true }
        );
    
        if (!result) {
            return { status: "error", message: "No matching avatar found to update." };
        }
    
        return { status: "success", message: "Avatar name updated successfully." };
    }
    

}

