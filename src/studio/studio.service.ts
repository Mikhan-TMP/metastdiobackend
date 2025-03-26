import { Injectable } from '@nestjs/common';
import { InjectModel  } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types} from 'mongoose';
import { Studio, StudioDocument } from '../models/studio.model';

@Injectable()
export class StudioService {
    constructor(
        @InjectModel(Studio.name) private studioModel: Model<StudioDocument>,
        private configService: ConfigService,
    ) {}
    


    //SAVING THE GENERATED IMAGE TO THE DATABASE
    async addStudio(email: string, imgSrc: Buffer, studioType: string, name: string) {
        if (!email) {
            return { message: "Invalid email. Please Sign up first.", status: "error" };
        }
        if (!imgSrc || !(imgSrc instanceof Buffer)) {
            return { message: "Invalid imgSrc. Expected a binary buffer.", status: "error" };
        }
        if (!studioType) {
            return { message: "Invalid type. Please specify a type.", status: "error" };
        }

        const base64Img = imgSrc.toString('base64');
    
        return await this.studioModel.findOneAndUpdate(
            { email }, 
            { $push: { studios: { name, imgSrc: base64Img, studioType } } }, 
            { new: true, upsert: true }
        );
    }

    // FETCH ALL THE STUDIOS
    async getStudios(email: string, studioType?: string, name?: string) {
        const query: any = { email };
        console.log("Email: ",email);
        console.log("Name: ",name);
        console.log("StudioType: ", studioType);
        if (studioType || name) {
            query.studios = { $elemMatch: {} };
    
            if (studioType) {
                query.studios.$elemMatch.studioType = studioType.trim();
            }
    
            if (name) {
                query.studios.$elemMatch.name = { $regex: name.trim(), $options: "i" }; // Case-insensitive search
            }
        }
    
        const studioRecords = await this.studioModel.find(query).exec();
        
        if (!studioRecords.length) {
            return { status: "error", message: "No studios found for this email with the specified filters." };
        }
    
        // Extract and return only matching images
        const studios = studioRecords.flatMap(record => 
            record.studios.filter(img => 
                (!studioType || img.studioType === studioType.trim()) && 
                (!name || new RegExp(name.trim(), "i").test(img.name)) // Case-insensitive check
            )
        );
    
        return studios.map(img => ({
            imgSrc: img.imgSrc,
            studioType: img.studioType,
            name: img.name,
            id: img._id
        }));
    }
    
    async deleteStudio(email: string, id: string) {
        if (!email || !id) {
            return { status: "error", message: "Email and studio ID are required to delete a Studio." };
        }
    
        // Convert id to ObjectId
        const objectId = new Types.ObjectId(id);
    
        const result = await this.studioModel.findOneAndUpdate(
            { email, "studios._id": objectId },
            { $pull: { studios: { _id: objectId } } }, 
            { new: true }
        );
    
        if (!result) {
            return { status: "error", message: "No matching studio found to delete." };
        }
    
        // Check if the Studio still exists
        const deleted = !result.studios.some(studio => studio._id.toString() === id);
        if (!deleted) {
            return { status: "error", message: "No matching Studio found to delete." };
        }
    
        return { status: "success", message: "Studio deleted successfully." };
    }

    async updateStudio(id: string, email: string, name?: string, studioType?: string) {
        if (!email || !id) {
            return { status: "error", message: "An email and studio ID are required to update a Studio." };
        }
    
        // Validate if `id` is a valid ObjectId
        if (!Types.ObjectId.isValid(id)) {
            return { status: "error", message: "Invalid Studio ID format." };
        }
    
        // Convert id to ObjectId
        const objectId = new Types.ObjectId(id);
    
        // Find the existing studio first
        const existingStudio = await this.studioModel.findOne(
            { email, "studios._id": objectId },
            { "studios.$": 1 } 
        );
    
        if (!existingStudio) {
            return { status: "error", message: "No matching Studio found to update." };
        }
    
        // Extract the studio details
        const studio = existingStudio.studios[0];
    
        // Check if the new values are actually different
        const updates: any = {};
        if (name && studio.name !== name) updates["studios.$.name"] = name;
        if (studioType && studio.studioType !== studioType) updates["studios.$.studioType"] = studioType;
    
        // If no actual changes are detected
        if (Object.keys(updates).length === 0) {
            return { status: "info", message: "No changes detected. Studio is already up to date." };
        }
    
        // Perform the update
        const result = await this.studioModel.findOneAndUpdate(
            { email, "studios._id": objectId },
            { $set: updates },
            { new: true }
        );
    
        return { status: "success", message: "Studio updated successfully."};
    }    
}