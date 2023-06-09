import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Video, VideoDocument } from "../database/schemas/video.schema";
import { CreateVideoDto } from "./dto/CreateVideoDto";
import { currUser } from "../users/types";
import { UserDocument } from "../database/schemas/user.schema";
import { Model } from "mongoose";

@Injectable()
export class VideosService {
  constructor(
    @InjectModel("Video") private readonly videoModel: Model<VideoDocument>,
    @InjectModel("User") private readonly userModel: Model<UserDocument>
  ) {}

  async findAll(limit = 20, page = 1): Promise<Video[]> {
    const offset = page * limit - limit;
    return await this.videoModel
      .find()
      .skip(offset)
      .limit(limit)
      .populate("user");
  }

  async findSubs(currUser: currUser, limit = 20, page = 1): Promise<Video[]> {
    const currentUser = await this.userModel.findById(currUser.userId);
    const offset = page * limit - limit;
    return await this.videoModel
      .find({
        user: {
          $in: currentUser.subscribedToUsers,
        },
      })
      .skip(offset)
      .limit(limit);
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
    if (String(deletedVideo.user._id) !== currUser.userId) {
      throw new ForbiddenException("Вы можете удалить только своё видео");
    }
    return String(deletedVideo._id);
  }

  async like(id: string, currUser: currUser): Promise<string> {
    const [targetVideo, currentUser] = await Promise.all([
      this.videoModel.findById(id),
      this.userModel.findById(currUser.userId),
    ]);

    if (!targetVideo) {
      throw new NotFoundException("Видео не найдено");
    }

    const isLiked = currentUser.likedVideos.find(
      (video) => String(video._id) === String(targetVideo._id)
    );

    if (isLiked) {
      throw new BadRequestException("Вы уже поставили лайк");
    }
    await Promise.all([
      this.videoModel.findByIdAndUpdate(id, {
        $inc: { likes: 1 },
      }),
      this.userModel.findByIdAndUpdate(currUser.userId, {
        $push: { likedVideos: targetVideo },
      }),
    ]);

    return "Успех";
  }

  async dislike(id: string, currUser: currUser): Promise<string> {
    const [targetVideo, currentUser] = await Promise.all([
      this.videoModel.findById(id),
      this.userModel.findById(currUser.userId),
    ]);

    if (!targetVideo) {
      throw new NotFoundException("Видео не найдено");
    }

    const isLiked = currentUser.likedVideos.find(
      (video) => String(video._id) === String(targetVideo._id)
    );

    if (!isLiked) {
      throw new BadRequestException("Вы не ставили лайк этому видео");
    }
    await Promise.all([
      this.videoModel.findByIdAndUpdate(id, {
        $inc: { likes: -1 },
      }),
      this.userModel.findByIdAndUpdate(currUser.userId, {
        $pull: { likedVideos: targetVideo._id },
      }),
    ]);

    return "Успех";
  }

  async addView(id: string): Promise<void> {
    await this.videoModel.findByIdAndUpdate(id, {
      $inc: { views: 1 },
    });
  }
}

