import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AudioDocument = Audio & Document;

@Schema({ _id: false })
export class Audio {
    @Prop({ type: Types.ObjectId, auto: false }) 
    _id: Types.ObjectId;
    
    @Prop({ required: false })
    name: string;

    @Prop({ required: false })
    audioSrc: string; 

    @Prop({ required: false })
    category: string;

    @Prop({ required: false })
    speaker: string;

    @Prop({ required: false })
    type: string;

    @Prop({ required: false, type: Number })
    volume: number;

    @Prop({ required: false, type: Number })
    fadeIn: number;

    @Prop({ required: false, type: Number })
    fadeOut: number;

    @Prop({ required: false, type: Boolean })
    voiceEnhance: boolean;

    @Prop({ required: false, type: Boolean })
    noiseReduction: boolean;
  }

  export const AudioSchema = SchemaFactory.createForClass(Audio);

  @Schema()
  export class AudioTitle {
    [x: string]: any;
    @Prop({ type: Types.ObjectId, auto: true }) 
    _id: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ type: [Audio], default: [] })
    audios: Audio[];
  }

  export const AudioTitleSchema = SchemaFactory.createForClass(AudioTitle);

  @Schema()
  export class UserAudio extends Document {
    @Prop({ required: false })
    titleId: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ type: [AudioTitle], default: [] }) 
    audios: AudioTitle[];
  }
  export const UserAudioSchema = SchemaFactory.createForClass(UserAudio);

