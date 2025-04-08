import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type GestureDocument = Gesture & Document;

@Schema()
export class Gesture {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    emoji: string;
}

export const GestureSchema = SchemaFactory.createForClass(Gesture);
