import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AvatarfxDocument = Avatarfx & Document;

class CameraView {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  src: string;

  @Prop({ required: true, default: false })
  is_selected: boolean;
}
class Gestures{
  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop()
  src: string;

  @Prop()
  is_selected: boolean;
}

class Emotions {
  @Prop()
  id: string;

  @Prop()
  name: string;
}
class Avatar {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  avatarID: string;

  @Prop({ type: () => CameraView })
  front: CameraView;

  @Prop({ type: () => CameraView })
  side: CameraView;

  @Prop({ type: () => CameraView })
  back: CameraView;

  @Prop({ type: () => CameraView })
  close_up: CameraView;

  @Prop({ type: [Gestures] })
  gestures: Gestures[];

  @Prop({ type: [Emotions] })
  emotions: Emotions[];
}

@Schema()
export class Avatarfx {
  @Prop({ required: true})
  email: string;

  @Prop({ type: [Avatar], required: true })
  avatars: Avatar[];
}

export const AvatarfxSchema = SchemaFactory.createForClass(Avatarfx);
