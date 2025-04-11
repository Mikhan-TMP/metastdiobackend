import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SequencesDocument = Sequences & Document;

class Action {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    actionName: string;
}
export @Schema({ _id: false })
class AvatarSequence {
    @Prop({ type: Types.ObjectId, required: true })
    id: Types.ObjectId;

    @Prop({ required: true })
    sequenceName: string;

    @Prop({ type: [Action], required: true })
    actions: Action[];
}
export const AvatarSequenceSchema = SchemaFactory.createForClass(AvatarSequence);

@Schema()
export class Sequences {
    @Prop({ required: true })
    email: string;

    @Prop({ type: Types.ObjectId, required: true })
    avatarId: Types.ObjectId;

    @Prop({ type: [AvatarSequence], required: true })
    avatarSequence: AvatarSequence[];
}

export const SequencesSchema = SchemaFactory.createForClass(Sequences);
