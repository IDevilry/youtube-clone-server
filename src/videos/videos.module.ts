import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoSchema } from 'src/database/schemas/video.schema';

@Module({
  providers: [VideosService],
  controllers: [VideosController],
  imports: [
    MongooseModule.forFeature([{ name: 'Video', schema: VideoSchema }]),
  ],
})
export class VideosModule {}
