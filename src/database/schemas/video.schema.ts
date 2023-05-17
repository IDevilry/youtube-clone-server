import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { type HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type VideoDocument = HydratedDocument<Video>;

@Schema({ timestamps: true })
export class Video {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  thumbnail: string;

  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: 'User' }], default: [] })
  likes: User[];

  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: 'User' }], default: [] })
  dislikes: User[];

  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
    default: [],
  })
  comments: Comment[];
}

export const VideoSchema = SchemaFactory.createForClass(Video);
