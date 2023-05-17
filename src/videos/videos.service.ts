import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Video } from 'src/database/schemas/video.schema';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel('Video') private readonly videoModel: Model<Video>,
  ) {}
}
