import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AvatarGenDocument = AvatarGen & Document;

@Schema()
export class AvatarGen {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ type: [{ name: String, imgSrc: String, style: String }], default: [] })
    avatars: {
        _id: any; name: string; imgSrc: string; style: string 
    }[]; 

    @Prop({ required: true })
    style: string;
}

export const AvatarGenSchema = SchemaFactory.createForClass(AvatarGen);
