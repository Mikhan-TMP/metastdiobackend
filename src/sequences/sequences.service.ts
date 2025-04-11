import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sequences, SequencesDocument } from '../models/sequences.model';

@Injectable()
export class SequencesService {
constructor(
        @InjectModel(Sequences.name)
        private sequencesModel: Model<SequencesDocument>,
    ) {}

    async addSequence(body: { email: string; avatarID: string; sequenceName: string; actions: { id: string; actionName: string }[]; }): Promise<Sequences> {
        const { email, avatarID, sequenceName, actions } = body;

        const newSequence = { id: new Types.ObjectId(), sequenceName,
            actions: actions.map((a) => ({
                id: a.id,
                actionName: a.actionName,
            })),
        };

        const newEntry = new this.sequencesModel({
            email,
            name: sequenceName, 
            avatarId: avatarID,
            avatarSequence: [newSequence],
        });
        return newEntry.save();
    }
    //get all sequences for all
    async getAllSequences(email: string, avatarID: string): Promise<Sequences[]> {

        return this.sequencesModel.find({ email, avatarId: avatarID }).exec();
    }


}
