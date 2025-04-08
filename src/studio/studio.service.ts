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
        const folderName = email.replace(/[^a-zA-Z0-9]/g, "_"); // Replace non-alphanumeric characters with underscores

        // Save the image to a folder
        const fs = require('fs');
        const path = require('path');
        const folderPath = path.join(process.env.STUDIOS_FOLDER, folderName);
    
        // Check if the folder exists, if not, create it
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true }); // Make sure it creates nested directories if needed
        }

        // Generate a unique file name for the studio
        const fileName = `${name}.png`;
        const filePath = path.join(folderPath, fileName);

        // Save the image to the folder
        fs.writeFileSync(filePath, imgSrc); // Save the image to the folder

        const fileUrl = `/shared/studios/${folderName}/${fileName}`;

        try {
            // Save only the file path (not the base64 image) to the database
            const result = await this.studioModel.findOneAndUpdate(
                { email },
                { $push: { studios: { name, imgSrc: fileUrl, studioType } } },
                { new: true, upsert: true }
            );

            // If the database operation is successful, return the result
            return result;
        } catch (error) {
            // If database operation fails, delete the saved image to avoid clutter
            fs.unlinkSync(filePath); // Delete the image

            return { 
                message: "Failed to save studio to the database. Image deleted.", 
                status: "error" 
            };
        }
    }

    // FETCH ALL THE STUDIOS
    async getStudios(email: string, studioType?: string, name?: string) {
        const query: any = { email };

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
        const fs = require('fs');
        const path = require('path');

        if (!email || !id) {
            return { status: "error", message: "Email and studio ID are required to delete a Studio." };
        }
    
        // Convert id to ObjectId
        const objectId = new Types.ObjectId(id);

        const studioRecord = await this.studioModel.findOne(
            { email, "studios._id": objectId },
            {"studios.$": 1 } // Only fetch the specific studio to be deleted
        );

        if (!studioRecord || !studioRecord.studios.length) {
            return { status: "error", message: "No matching studio found to delete." };
        }
    
        const studioToDelete = studioRecord.studios[0];
        const imgSrc = studioToDelete.imgSrc;

        const filePath = path.join(process.env.STUDIOS_FOLDER, imgSrc.replace('/shared/studios/', '')); // Remove leading slash
        console.log("Attempting to delete file at:", filePath);  // Log the file path

        try{
            const session = await this.studioModel.startSession();
            session.startTransaction();
            if (fs.existsSync(filePath)){
                fs.unlinkSync(filePath); // Delete the image file
                console.log("File deleted successfully:", filePath);  // Log success
            }else{
                console.log("File not found:", filePath);  // Log file not found
            }

            const result = await this.studioModel.findOneAndUpdate(
                { email, "studios._id": objectId },
                { $pull: { studios: { _id: objectId } } },
                { new: true, session } // Use the session for the transaction
            );

            if (!result){
                throw new Error("Failed to delete studio from database.");
            }
            await session.commitTransaction();
            session.endSession();
            return { status: "success", message: "Studio deleted successfully." };

        }catch(error){
            console.error("Error deleting studio:", error);  // Log the error
            return { status: "error", message: "Failed to delete studio." };
        }
    
    }

    async updateStudio(id: string, email: string, name?: string, studioType?: string) {
        const fs = require('fs');
        const path = require('path');
    
        if (!email || !id) {
            return { status: "error", message: "An email and studio ID are required to update a Studio." };
        }
    
        if (!Types.ObjectId.isValid(id)) {
            return { status: "error", message: "Invalid Studio ID format." };
        }
    
        const objectId = new Types.ObjectId(id);
    
        // Find the existing studio
        const existingStudio = await this.studioModel.findOne(
            { email, "studios._id": objectId },
            { "studios.$": 1 }
        );
    
        if (!existingStudio || !existingStudio.studios.length) {
            return { status: "error", message: "No matching Studio found to update." };
        }

        const studioToUpdate = existingStudio.studios[0];
        const oldImgSrc = studioToUpdate.imgSrc;
        const folderName = email.replace(/[^a-zA-Z0-9]/g, "_");
        const oldFilePath = path.join(process.env.STUDIOS_FOLDER, oldImgSrc.replace('/shared/studios/', ''));
        const newFileName = `${name}.png`; // Generate the new file name
        const newImgSrc = `/shared/studios/${folderName}/${newFileName}`;
        const newFilePath = path.join(process.env.STUDIOS_FOLDER, folderName, newFileName);

        try {
            const session = await this.studioModel.startSession();
            session.startTransaction();
    
            // Check if the file exists
            if (fs.existsSync(oldFilePath)) {
                // Rename the file to the new name
                fs.renameSync(oldFilePath, newFilePath); // Rename the file
            } else {
                throw new Error("File to update does not exist.");
            }
    
            // Update the database with the new file path and studio name
            const result = await this.studioModel.findOneAndUpdate(
                { email, "studios._id": objectId },
                { 
                    $set: { 
                        "studios.$.name": name, 
                        "studios.$.imgSrc": newImgSrc 
                    }
                },
                { new: true, session } // Use session for transactional rollback
            );
    
            if (!result) {
                throw new Error("No matching studio found to update in the database.");
            }
    
            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
    
            return { status: "success", message: "Studio name and file updated successfully." };
        } catch (error) {
            console.error(error); // Log the error for debugging
    
            // If there was an error, rollback the transaction and restore file if necessary
            if (fs.existsSync(newFilePath)) {
                fs.unlinkSync(newFilePath); // If file was renamed, remove it
            }
    
            return { status: "error", message: "Failed to update the studio. No changes have been made." };
        }
    }
    
}