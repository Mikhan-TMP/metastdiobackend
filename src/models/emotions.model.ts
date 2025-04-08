import {Schema, Prop, SchemaFactory} from "@nestjs/mongoose";
import { Document } from "mongoose";

export type EmotionsDocument = Emotions & Document;

@Schema()
export class Emotions {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    emoji: string;
}

export const EmotionsSchema = SchemaFactory.createForClass(Emotions);