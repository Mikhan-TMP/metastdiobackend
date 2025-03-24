import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AvatarGenDocument = AvatarGen & Document;

@Schema()
export class AvatarGen {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    imgSrc: string;  
}

export const AvatarGenSchema = SchemaFactory.createForClass(AvatarGen);
