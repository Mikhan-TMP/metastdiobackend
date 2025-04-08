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
    async addAvatar(email: string, imgSrc: Buffer, style: string, name: string) {
        if (!email) {
            return { message: "Invalid email. Please Sign up first.", status: "error" };
        }
        if (!imgSrc || !(imgSrc instanceof Buffer)) {
            return { message: "Invalid imgSrc. Expected a binary buffer.", status: "error" };
        }
        if (!style) {
            return { message: "Invalid style. Please specify a style.", status: "error" };
        }
    
        // Generate a folder name based on the email
        const folderName = email.replace(/[^a-zA-Z0-9]/g, "_"); // Replace non-alphanumeric characters with underscores
    
        // Save the image to a folder
        const fs = require('fs');
        const path = require('path');
        const folderPath = path.join(process.env.AVATAR_FOLDER, folderName);
    
        // Check if the folder exists, if not, create it
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true }); // Make sure it creates nested directories if needed
        }
    
        // Generate a unique file name for the avatar
        const fileName = `${name}.png`;
        const filePath = path.join(folderPath, fileName);
    
        // Save the image to the folder
        fs.writeFileSync(filePath, imgSrc); // Save the image to the folder
    
        const fileUrl = `/shared/avatars/${folderName}/${fileName}`;
    
        try {
            // Save only the file path (not the base64 image) to the database
            const result = await this.avatarGenModel.findOneAndUpdate(
                { email },
                { $push: { avatars: { name, imgSrc: fileUrl, style } } },
                { new: true, upsert: true }
            );
    
            // If the database operation is successful, return the result
            return result;
        } catch (error) {
            // If database operation fails, delete the saved image to avoid clutter
            fs.unlinkSync(filePath); // Delete the image
    
            return { message: "Failed to save avatar to the database. Image deleted.", status: "error" };
        }
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
    
        // Return the details of the avatars, including the file path
        return avatars.map(img => ({
            imgSrc: img.imgSrc,  // This will now contain the relative path to the image
            style: img.style,
            name: img.name,
            id: img._id
        }));
    }
    



    async deleteAvatar(email: string, id: string) {
        const fs = require('fs');
        const path = require('path');
        if (!email || !id) {
            return { status: "error", message: "Email and avatar ID are required to delete an avatar." };
        }
    
        // Convert id to ObjectId
        const objectId = new Types.ObjectId(id);
    
        // Find the avatar and get its file path (imgSrc)
        const avatarRecord = await this.avatarGenModel.findOne(
            { email, "avatars._id": objectId },
            { "avatars.$": 1 } // Only return the specific avatar
        );
    
        if (!avatarRecord || !avatarRecord.avatars.length) {
            return { status: "error", message: "No matching avatar found to delete." };
        }
    
        // Get the imgSrc of the avatar to delete
        const avatarToDelete = avatarRecord.avatars[0];
        const imgSrc = avatarToDelete.imgSrc;
    
        // Delete the image file from the filesystem
        const filePath = path.join(process.env.AVATAR_FOLDER, imgSrc.replace('/shared/avatars/', ''));
        console.log("Attempting to delete file at:", filePath);  // Log the file path
    
        try {
            // Start a transaction or a safeguard mechanism if needed (for MongoDB)
            const session = await this.avatarGenModel.startSession();
            session.startTransaction();
    
            // Check if the file exists before trying to delete it
            if (fs.existsSync(filePath)) {
                // Delete the image file from the filesystem
                fs.unlinkSync(filePath); // Delete the image file
                console.log("File deleted successfully.");  // Log success
            } else {
                console.log("File does not exist at path:", filePath);  // Log if file does not exist
            }
    
            // Proceed with the database operation to remove the avatar
            const result = await this.avatarGenModel.findOneAndUpdate(
                { email, "avatars._id": objectId },
                { $pull: { avatars: { _id: objectId } } }, // Remove the specific avatar
                { new: true, session } // Use session for transactional rollback
            );
    
            if (!result) {
                throw new Error("No matching avatar found to delete in database.");
            }
    
            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
    
            return { status: "success", message: "Avatar deleted successfully." };
        } catch (error) {
            // Rollback if an error occurs in any of the steps
            console.error(error);  // Log the error for debugging
    
            return { status: "error", message: "Failed to delete the avatar. No changes have been made." };
        }
    }
    
    

    async updateAvatar(id: string, email: string, name: string) {
        const fs = require('fs');
        const path = require('path');
        
        if (!email || !id || !name) {
            return { status: "error", message: "Email, avatar ID, and new name are required to update an avatar." };
        }
    
        // Validate if `id` is a valid ObjectId
        if (!Types.ObjectId.isValid(id)) {
            return { status: "error", message: "Invalid avatar ID format." };
        }
    
        // Convert id to ObjectId
        const objectId = new Types.ObjectId(id);
    
        // Find the avatar and get its file path (imgSrc)
        const avatarRecord = await this.avatarGenModel.findOne(
            { email, "avatars._id": objectId },
            { "avatars.$": 1 } // Only return the specific avatar
        );
    
        if (!avatarRecord || !avatarRecord.avatars.length) {
            return { status: "error", message: "No matching avatar found to update." };
        }
    
        // Get the imgSrc of the avatar to update
        const avatarToUpdate = avatarRecord.avatars[0];
        const oldImgSrc = avatarToUpdate.imgSrc; // The old file path in the database
        const folderName = email.replace(/[^a-zA-Z0-9]/g, "_"); // Generate folder name from email
        const oldFilePath = path.join(process.env.AVATAR_FOLDER, oldImgSrc.replace('/shared/avatars/', ''));
        const newFileName = `${name}.png`; // Generate the new file name
        const newImgSrc = `/shared/avatars/${folderName}/${newFileName}`;
        const newFilePath = path.join(process.env.AVATAR_FOLDER, folderName, newFileName);
    
        try {
            // Start a transaction or safeguard mechanism if needed (for MongoDB)
            const session = await this.avatarGenModel.startSession();
            session.startTransaction();
    
            // Check if the file exists
            if (fs.existsSync(oldFilePath)) {
                // Rename the file to the new name
                fs.renameSync(oldFilePath, newFilePath); // Rename the file
            } else {
                throw new Error("File to update does not exist.");
            }
    
            // Update the database with the new file path and avatar name
            const result = await this.avatarGenModel.findOneAndUpdate(
                { email, "avatars._id": objectId },
                { 
                    $set: { 
                        "avatars.$.name": name, 
                        "avatars.$.imgSrc": newImgSrc 
                    }
                },
                { new: true, session } // Use session for transactional rollback
            );
    
            if (!result) {
                throw new Error("No matching avatar found to update in the database.");
            }
    
            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
    
            return { status: "success", message: "Avatar name and file updated successfully." };
        } catch (error) {
            console.error(error); // Log the error for debugging
    
            // If there was an error, rollback the transaction and restore file if necessary
            if (fs.existsSync(newFilePath)) {
                fs.unlinkSync(newFilePath); // If file was renamed, remove it
            }
    
            return { status: "error", message: "Failed to update the avatar. No changes have been made." };
        }
    }
    
    

}

