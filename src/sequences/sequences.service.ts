import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Sequences, SequencesDocument } from '../models/sequences.model';

@Injectable()
export class SequencesService {
constructor(
        @InjectModel(Sequences.name)
        private sequencesModel: Model<SequencesDocument>,
    ) {}

    async addSequence(body: { email: string; avatarID: string; sequenceName: string; actions: { id: string; actionName: string }[]; }): Promise<Sequences> {
        const { email, avatarID, sequenceName, actions } = body;
    
        const newSequence = {
            id: new Types.ObjectId(),
            sequenceName,
            actions: actions.map((a) => ({
                id: a.id,
                actionName: a.actionName,
            })),
        };
    
        const updatedEntry = await this.sequencesModel.findOneAndUpdate(
            { email, avatarId: avatarID },
            { $push: { avatarSequence: newSequence } },
            { new: true, upsert: true }
        ).exec();
    
        return updatedEntry;
    }
    
    //get all sequences for all
    async getAllSequences(email: string, avatarID: string): Promise<Sequences[]> {
        return this.sequencesModel.find({ email, avatarId: avatarID })
            .exec()
            .catch((error) => {
                console.error(error);
                return [];
            });
    }

    async deleteSequence(email: string, avatarID: string, sequenceID: string): Promise<Sequences[]> {
        console.log('email: ', email,' avatarID: ', avatarID, 'sequenceID: ', sequenceID);
        try {
            const updatedEntry = await this.sequencesModel.findOneAndUpdate(
                { email, avatarId: avatarID },
                { $pull: { avatarSequence: { id: new mongoose.Types.ObjectId(sequenceID) } } },
                { new: true }
            ).exec();
    
            if (!updatedEntry) {
                throw new Error(`No sequences found with email: ${email} and avatarID: ${avatarID}`);
            }
    
            return [{
                email: updatedEntry.email,
                avatarId: updatedEntry.avatarId,
                avatarSequence: updatedEntry.avatarSequence,
            }];
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    




}
