import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AudioDocument = Audio & Document;

@Schema({ _id: false })
export class Audio {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  audioSrc: string; // Base64 or URL

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  speaker: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true, type: Number })
  volume: number;

  @Prop({ required: true, type: Number })
  fadeIn: number;

  @Prop({ required: true, type: Number })
  fadeOut: number;

  @Prop({ required: true, type: Boolean })
  voiceEnhance: boolean;

  @Prop({ required: true, type: Boolean })
  noiseReduction: boolean;
}

export const AudioSchema = SchemaFactory.createForClass(Audio);

@Schema()
export class AudioTitle {
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
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: [AudioTitle], default: [] })  // Change to an array
  audios: AudioTitle[];
}

export const UserAudioSchema = SchemaFactory.createForClass(UserAudio);

