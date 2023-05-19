import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CreateUserRegDto } from "../auth/dto/CreateUserRegDto";
import { User } from "../database/schemas/user.schema";
import { UpdateUserDto } from "./dto/UpdateUser.dto";
import { type currUser } from "./types";
import mongoose, { Model } from "mongoose";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel("User")
    private readonly userModel: Model<User>
  ) {}

  async findAll(limit = 20, page = 1): Promise<User[]> {
    try {
      const offset = limit * page - limit;
      return await this.userModel
        .find({}, { password: 0 })
        .skip(offset)
        .limit(limit)
        .sort({ _id: -1 });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: id }, { password: 0 });
    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }
    return user;
  }

  async findMe(currUser: currUser): Promise<User> {
    return await this.userModel.findOne({
      _id: currUser.userId,
    });
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (user) {
      return user.toObject();
    }
  }

  async create<T = CreateUserRegDto>(user: T): Promise<Omit<User, "password">> {
    const createdUser = await this.userModel.create(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = createdUser.toObject();
    return result;
  }

  async update(
    id: string,
    user: UpdateUserDto,
    currUser: currUser
  ): Promise<User> {
    if (id !== currUser.userId) {
      throw new ForbiddenException("Редактировать можно только свой аккаунт");
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(id, user, {
      fields: { password: 0 },
      new: true,
    });
    if (!updatedUser) {
      throw new NotFoundException("Пользователь не найден");
    }
    return updatedUser;
  }

  async delete(id: string, currUser: currUser): Promise<string> {
    if (id !== currUser.userId) {
      throw new ForbiddenException("Удалить можно только свой аккаунт");
    }
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new NotFoundException("Пользователь не найден");
    }
    return deletedUser._id;
  }

  async subscribe(id: string, currUser: currUser): Promise<string> {
    const [targetUser, currentUser] = await Promise.all([
      this.userModel.findById(id),
      this.userModel.findById(currUser.userId),
    ]);

    if (!targetUser) {
      throw new NotFoundException("Пользователь не найден");
    }

    const isSub = currentUser.subscribedToUsers.find(
      (user) => user._id === targetUser._id
    );

    if (isSub) {
      throw new BadRequestException("Вы уже подписаны");
    }
    await Promise.all([
      this.userModel.findByIdAndUpdate(id, {
        $inc: { subscribers: 1 },
      }),
      this.userModel.findByIdAndUpdate(currUser.userId, {
        $push: { subscribedToUsers: targetUser },
      }),
    ]);
    return "Успех";
  }

  async unsubscribe(id: string, currUser: currUser): Promise<string> {
    const [targetUser, currentUser] = await Promise.all([
      this.userModel.findById(id),
      this.userModel.findById(currUser.userId),
    ]);

    if (!targetUser) {
      throw new NotFoundException("Пользователь не найден");
    }

    const isSub = currentUser.subscribedToUsers.find(
      (user) => user._id === targetUser._id
    );

    if (!isSub) {
      throw new BadRequestException("Вы не подписаны");
    }

    await Promise.all([
      this.userModel.findByIdAndUpdate(id, {
        $inc: { subscribers: -1 },
      }),
      this.userModel.findByIdAndUpdate(currUser.userId, {
        $pull: {
          subscribedToUsers: new mongoose.Types.ObjectId(targetUser._id),
        },
      }),
    ]);

    return "Успех";
  }
}

