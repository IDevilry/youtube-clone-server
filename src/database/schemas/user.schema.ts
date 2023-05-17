import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { type HydratedDocument } from 'mongoose';
import { Video } from './video.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  _id: string;
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String })
  profileImage: string;

  @Prop({ type: Number })
  subscribers: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  subscribedUsers: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }] })
  videos: Video[];
}

export const UserSchema = SchemaFactory.createForClass(User);
