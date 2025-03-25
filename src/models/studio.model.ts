import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudioDocument = Studio & Document;

@Schema()
export class Studio {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ type: [{ name: String, imgSrc: String, studioType: String }], default: [] })
    studios: {
        _id: any; name: string; imgSrc: string; studioType: string;
    }[]; 
    @Prop({ required: true })
    studioType: string;
    
    @Prop({ required: true })
    id: string;
}

export const StudioSchema = SchemaFactory.createForClass(Studio);
