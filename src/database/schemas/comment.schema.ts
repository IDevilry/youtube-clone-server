import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
import { Video } from './video.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Video' })
  video: Video;

  @Prop({ type: String })
  text: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
