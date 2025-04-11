import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';


export type AvatarEffectsDocument = AvatarEffects & Document;

class CameraView {
    @Prop({ required: true })
    id: string;
    @Prop({ required: true })
    src: string;
}

@Schema({ _id: true }) 
export class Emotions {
  @Prop()
  name: string;

  @Prop()
  baseImg: string;

  @Prop({ type: () => CameraView })
  front: CameraView;

  @Prop({ type: () => CameraView })
  side: CameraView;

  @Prop({ type: () => CameraView })
  back: CameraView;

  @Prop({ type: () => CameraView })
  close_up: CameraView;
}

@Schema({ _id: true }) 
export class Gestures {
  @Prop()
  name: string;

  @Prop()
  baseImg: string;

  @Prop({ type: () => CameraView })
  front: CameraView;

  @Prop({ type: () => CameraView })
  side: CameraView;

  @Prop({ type: () => CameraView })
  back: CameraView;

  @Prop({ type: () => CameraView })
  close_up: CameraView;
}
@Schema()
export class AvatarEffects{
    @Prop({required: true})
    email: string
    @Prop({required: true})
    name: string
    @Prop({ required: true })
    avatarId: Types.ObjectId;
    @Prop({ type: [Emotions] })
    Emotions: Emotions[];
    @Prop({ type: [Gestures]  })
    Gestures: Gestures[];
}
export const AvatarEffectsSchema = SchemaFactory.createForClass(AvatarEffects);