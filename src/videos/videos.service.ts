import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import mongoose, { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Video } from "../database/schemas/video.schema";
import { CreateVideoDto } from "./dto/CreateVideoDto";
import { currUser } from "../users/types";
import { User } from "../database/schemas/user.schema";

@Injectable()
export class VideosService {
  constructor(
    @InjectModel("Video") private readonly videoModel: Model<Video>,
    @InjectModel("User") private readonly userModel: Model<User>
  ) {}

  async findAll(): Promise<Video[]> {
    return await this.videoModel.find();
  }

  async findOne(id: string): Promise<Video> {
    return await this.videoModel.findOne({ _id: id });
  }

  async create(video: CreateVideoDto): Promise<Video> {
    return await this.videoModel.create(video);
  }

  async delete(id: string, currUser: currUser): Promise<string> {
    const deletedVideo = await this.videoModel.findByIdAndDelete(id);
    if (!deletedVideo) {
      throw new NotFoundException("Видео не найдно");
    }
    if (deletedVideo.user._id !== currUser.userId) {
      throw new ForbiddenException("Вы можете удалить только своё видео");
    }
    return String(deletedVideo._id);
  }

  async like(id: string, currUser: currUser): Promise<string> {
    const targetVideo = await this.videoModel.findById(id);
    if (!targetVideo) {
      throw new NotFoundException("Видео не найдено");
    }

    const isLiked = targetVideo.likes.find(
      (user) => String(user._id) === currUser.userId
    );

    if (isLiked) {
      throw new BadRequestException("Вы уже поставили лайк");
    }

    await this.videoModel.findByIdAndUpdate(id, {
      $push: { likes: new mongoose.Types.ObjectId(currUser.userId) },
    });

    await this.userModel.findByIdAndUpdate(currUser.userId, {
      $push: { likedVideos: targetVideo },
    });

    return "Успех";
  }

  async dislike(id: string, currUser: currUser): Promise<string> {
    const targetVideo = await this.videoModel.findById(id);
    if (!targetVideo) {
      throw new NotFoundException("Видео не найдено");
    }

    const isLiked = targetVideo.likes.find(
      (user) => String(user._id) === currUser.userId
    );

    if (!isLiked) {
      throw new BadRequestException("Вы не ставили лайк этому видео");
    }

    await this.videoModel.findByIdAndUpdate(id, {
      $pull: { likes: new mongoose.Types.ObjectId(currUser.userId) },
    });

    await this.userModel.findByIdAndUpdate(currUser.userId, {
      $pull: { likedVideos: targetVideo._id },
    });

    return "Успех";
  }

  async addView(id: string): Promise<void> {
    await this.videoModel.findByIdAndUpdate(id, {
      $inc: { views: 1 },
    });
  }
}

