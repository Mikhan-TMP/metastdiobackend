    import { Injectable } from '@nestjs/common';
    import { InjectModel } from '@nestjs/mongoose';
    import { Model, Types } from 'mongoose';
    import { UserAudio, Audio, AudioTitle } from '../models/audio.model';
    import { ConfigService } from '@nestjs/config';



    @Injectable()
    export class AudioService {

    constructor(
    private configService: ConfigService,
    @InjectModel(UserAudio.name) private userAudioModel: Model<UserAudio>) {}

    async addAudio(email: string, title: string, audioDataArray: Audio[], titleId?: string,): Promise<UserAudio> {
        const fs = require('fs');
        const path = require('path');
        const folderName = email.replace(/[^a-zA-Z0-9]/g, "_"); // Sanitize email for folder naming
        const audioBaseFolder = process.env.AUDIOS_FOLDER;
        const userFolderPath = path.join(audioBaseFolder, folderName); // User folder based on email
        const titleFolderPath = path.join(userFolderPath, title); // Title folder inside user's folder

        if (!audioDataArray || !Array.isArray(audioDataArray)) {
            throw new Error("audioDataArray is required and must be an array");
        }

        // Ensure the user's folder exists
        if (!fs.existsSync(userFolderPath)) {
            fs.mkdirSync(userFolderPath, { recursive: true }); // Create user's folder if it doesn't exist
        }

        // Ensure the title folder exists inside the user's folder
        if (!fs.existsSync(titleFolderPath)) {
            fs.mkdirSync(titleFolderPath, { recursive: true }); // Create the title folder if it doesn't exist
        }

        let user = await this.userAudioModel.findOne({ email });

        if (!user) {
            user = new this.userAudioModel({ email, audios: [] });
            await user.save();
        }

        let titleEntry = user.audios.find((audioTitle) => audioTitle.title === title);

        if (!titleEntry) {
            titleEntry = {
                _id: new Types.ObjectId(),
                title,
                audios: []
            };

            user.audios.push(titleEntry);
        }

        // Ensure we have the latest reference
        titleEntry = user.audios.find((audioTitle) => audioTitle.title === title);

        if (titleEntry) {
            const newAudios = audioDataArray.map(audio => {
            const audioId = new Types.ObjectId(); // Generate a new ObjectId for each audio
            const fileName = `${audio.name}`; //
            const filePath = path.join(titleFolderPath, fileName); // Path to save the audio inside the title folder
            const fileUrl = `/shared/audios/${folderName}/${title}/${fileName}`; // URL to store in DB

            // Convert base64 audio to Buffer and save it to file
            if (audio.audioSrc && typeof audio.audioSrc === 'string') {
                const audioBuffer = Buffer.from(audio.audioSrc, 'base64'); // Convert base64 string to Buffer
                fs.writeFileSync(filePath, audioBuffer); // Save the audio file to the file system
            } else {
                console.error("Invalid or missing audio source provided for audio:", audio.name);
            }

            return {
                ...audio,
                _id: audioId,
                audioSrc: fileUrl // Save only the path in the DB, not the actual file content
            };
        });

            titleEntry.audios.push(...newAudios);
        }

        user.markModified('audios');
        return user.save();
    }


    async getAllScript(email: string): Promise<{ status: string; message: string; titles: { id: string, title: string }[] }> {
    const result = await this.userAudioModel.findOne({ email });

    return {
        status: result ? 'success' : 'error',
        message: result ? 'Audio list retrieved successfully' : 'No audio list found for this email',
        titles: result ? result.audios.map(title => ({ id: title._id.toString(), title: title.title })) : []
    };
    }
    async getScript(email: string, titleId: string): Promise<{ status: string; message: string; audios: Audio[] }> {
    const result = await this.userAudioModel.findOne({ email });

    if (!result) {
        return {
        status: 'error',
        message: 'No audio list found for this email',
        audios: []
        };
    }

    const titleEntry = result.audios.find(title => title._id.toString() === titleId);

    if (!titleEntry) {
        return {
        status: 'error',
        message: 'No audio entry found with the given title ID',
        audios: []
        };
    }

    return {
        status: 'success',
        message: 'Audio list retrieved successfully',
        audios: titleEntry.audios
    };
    }
    async updateAudio(email: string, titleId: string, audioId: string, updateData: Partial<Audio>): Promise<{ status: string; message: string }> {
    const fs = require('fs');
    const path = require('path');

    const user = await this.userAudioModel.findOne({ email });
    if (!user) {
        return {
            status: 'error',
            message: 'Invalid Email. Please try again.',
        };
    }

    const titleEntry = user.audios.find(title => title._id.toString() === titleId);
    if (!titleEntry) {
        return {
            status: 'error',
            message: 'Invalid titleId. Please try again.',
        };
    }

    const audioEntry = titleEntry.audios.find(audio => audio._id.toString() === audioId);
    if (!audioEntry) {
        return {
            status: 'error',
            message: 'Invalid audioId. Please try again.',
        };
    }

    // Track if changes are made
    let isUpdated = false;

    // Handle audio name change and file rename
    if (updateData.name && updateData.name !== audioEntry.name) {
        const folderName = email.replace(/[^a-zA-Z0-9]/g, "_"); // Generate folder name from email
        const audioBaseFolder = process.env.AUDIOS_FOLDER;
        const oldFilePath = path.join(audioBaseFolder, folderName, titleEntry.title, `${audioEntry.name}.wav`); // Old file path
        const newFilePath = path.join(audioBaseFolder, folderName, titleEntry.title, `${updateData.name}.wav`); // New file path

        try {
            // Check if the old file exists
            if (fs.existsSync(oldFilePath)) {
                // Rename the file in the filesystem
                fs.renameSync(oldFilePath, newFilePath); // Rename the file
                // Update audioSrc in the database to reflect the new filename
                audioEntry.audioSrc = audioEntry.audioSrc.replace(audioEntry.name, updateData.name);
            } else {
                console.error("Audio file does not exist:", oldFilePath);
                return {
                    status: 'error',
                    message: 'Audio file does not exist to rename.',
                };
            }
        } catch (error) {
            console.error("Error renaming file:", error);
            return {
                status: 'error',
                message: 'Failed to rename audio file.',
            };
        }
    }

    // Update other fields in the audio entry
    Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && (audioEntry as any)[key] !== updateData[key]) {
            (audioEntry as any)[key] = updateData[key];
            isUpdated = true;
        }
    });

    if (!isUpdated) {
        return {
            status: 'info',
            message: 'No changes made to the audio.',
        };
    }

    user.markModified('audios');
    await user.save();

    return {
        status: 'success',
        message: 'Audio updated successfully',
    };
    }

    async updateTitle(email: string, titleId: string, newTitle: string): Promise<{ status: string; message: string }> {
    const fs = require('fs');
    const path = require('path');
    const user = await this.userAudioModel.findOne({ email });

    if (!user) {
        return {
            status: 'error',
            message: 'No user found with this email.',
        };
    }

    const titleEntry = user.audios.find(title => title._id.toString() === titleId);
    if (!titleEntry) {
        return {
            status: 'error',
            message: 'Invalid titleId. Please try again.',
        };
    }

    // Check if the title is actually changing
    if (titleEntry.title === newTitle) {
        return {
            status: 'error',
            message: 'No changes made. The title is already the same.',
        };
    }

    // Get the base path for the user's folder
    const folderName = email.replace(/[^a-zA-Z0-9]/g, "_"); // Sanitize email for folder naming
    const audioBaseFolder = process.env.AUDIOS_FOLDER;
    const userFolderPath = path.join(audioBaseFolder, folderName); // User folder based on email

    // Paths for the old and new title folders
    const oldTitleFolderPath = path.join(userFolderPath, titleEntry.title);
    const newTitleFolderPath = path.join(userFolderPath, newTitle);
    console.log(titleEntry);

    try {
        // Before renaming the folder, update the `audioSrc` in the audio entries to reflect the new folder name
        titleEntry.audios.forEach(audio => {
            const oldFilePath = audio.audioSrc;
            console.log('Old file path:', oldFilePath); // Debugging line

            // Ensure the old title is actually a part of the audioSrc
            if (oldFilePath.includes(titleEntry.title)) {
                console.log('old title: ', titleEntry.title); // Debugging line
                console.log('new title: ', newTitle); // Debugging line
                const newFilePath = oldFilePath.replace(`/${titleEntry.title}/`, `/${newTitle}/`); // Replace the old title with the new one in the file path
                console.log('New file path:', newFilePath); // Debugging line
                audio.audioSrc = newFilePath; // Update the audioSrc path
                console.log('Updated audioSrc:', audio.audioSrc); // Debugging line
            } else {
                console.warn(`Old title '${titleEntry.title}' not found in path: ${oldFilePath}`);
            }
        });

        // Rename the folder in the filesystem after updating paths in the database
        fs.renameSync(oldTitleFolderPath, newTitleFolderPath); // Rename the folder
    } catch (error) {
        console.error('Error renaming folder or updating file paths:', error);
        return {
            status: 'error',
            message: 'Failed to rename the title folder or update the audio files in the file system.',
        };
    }

    // Update the title in the database
    titleEntry.title = newTitle;

    user.markModified('audios'); // Ensure MongoDB detects the change
    await user.save();

    return {
        status: 'success',
        message: 'Script title updated successfully, and the folder and audio paths were renamed.',
    };
    }

    async deleteAudio(email: string, titleId: string, audioId: string): Promise<{ status: string; message: string }> {
    const fs = require('fs');
    const path = require('path');

    const user = await this.userAudioModel.findOne({ email });

    if (!user) {
        return {
            status: 'error',
            message: 'No user found with this email.',
        };
    }

    const titleEntry = user.audios.find(title => title._id.toString() === titleId);
    if (!titleEntry) {
        return {
            status: 'error',
            message: 'Invalid titleId. Please try again.',
        };
    }

    const audioEntry = titleEntry.audios.find(audio => audio._id.toString() === audioId);
    if (!audioEntry) {
        return {
            status: 'error',
            message: 'Invalid audioId. Please try again.',
        };
    }

    // Construct file path
    const folderName = email.replace(/[^a-zA-Z0-9]/g, "_"); // Sanitize email
    const audioBaseFolder = process.env.AUDIOS_FOLDER;
    const filePath = path.join(audioBaseFolder, folderName, titleEntry.title, `${audioEntry.name}`);

    try {
        // Check if the file exists before deleting
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Delete the audio file
            console.log("Audio file deleted:", filePath);
        } else {
            console.warn("Audio file does not exist at path:", filePath);
        }

        // Remove the audio entry from the array
        titleEntry.audios = titleEntry.audios.filter(audio => audio._id.toString() !== audioId);
        user.markModified('audios');
        await user.save();

        return {
            status: 'success',
            message: 'Audio deleted successfully',
        };
    } catch (error) {
        console.error("Failed to delete audio file:", error);
        return {
            status: 'error',
            message: 'Failed to delete the audio file or database entry.',
        };
    }
    }


    async deleteScript(email: string, titleId: string): Promise<{ status: string; message: string }> {
    const fs = require('fs');
    const path = require('path');

    const user = await this.userAudioModel.findOne({ email });

    if (!user) {
        return {
            status: 'error',
            message: 'No user found with this email.',
        };
    }

    const titleEntry = user.audios.find(title => title._id.toString() === titleId);
    if (!titleEntry) {
        return {
            status: 'error',
            message: 'Invalid titleId. Please try again.',
        };
    }

    // Construct folder path
    const folderName = email.replace(/[^a-zA-Z0-9]/g, "_"); // Sanitize email
    const audioBaseFolder = process.env.AUDIOS_FOLDER;
    const folderPath = path.join(audioBaseFolder, folderName, titleEntry.title);

    try {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true }); // Delete the folder and its contents
            console.log("Folder deleted:", folderPath);
        } else {
            console.warn("Folder does not exist at path:", folderPath);
        }

        // Remove the title entry
        user.audios = user.audios.filter(title => title._id.toString() !== titleId);
        user.markModified('audios');
        await user.save();

        return {
            status: 'success',
            message: 'Script and associated folder deleted successfully',
        };
    } catch (error) {
        console.error("Error deleting folder:", error);
        return {
            status: 'error',
            message: 'Failed to delete the folder or update the database.',
        };
    }
    }



    }
