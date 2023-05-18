import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from '../database/schemas/comment.schema';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
  ],
})
export class CommentsModule {}
