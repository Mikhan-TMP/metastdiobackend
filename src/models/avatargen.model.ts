import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AvatarGenDocument = AvatarGen & Document;

@Schema()
export class AvatarGen {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ type: [{ imgSrc: String, style: String }], default: [] }) // Store images with styles
    imgSrc: { imgSrc: string; style: string }[]; 
}

export const AvatarGenSchema = SchemaFactory.createForClass(AvatarGen);
