/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CreateUserRegDto } from "../auth/dto/CreateUserRegDto";
import { CreateUserDto } from "./dto/CreateUserDto";
import { User } from "../database/schemas/user.schema";
import { currUser } from "./types";
import mongoose, { Model } from "mongoose";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel("User")
    private readonly userModel: Model<User>
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find({}, { password: 0 });
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
    return this.userModel.findOne({ email });
  }

  async create<T = CreateUserRegDto>(user: T): Promise<any> {
    const createdUser = await this.userModel.create(user);
    const { password, ...result } = createdUser.toObject();
    return result;
  }

  async update(
    id: string,
    user: CreateUserDto,
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

  async subscribe(id: string, currUser: currUser) {
    const targetUser = await this.userModel.findById(id);
    if (!targetUser) {
      throw new NotFoundException("Пользователь не найден");
    }

    const currentUser = await this.userModel.findById(currUser.userId);
    const isSub = currentUser.subscribedToUsers.find(
      (user) => user._id === targetUser._id
    );

    if (isSub) {
      throw new BadRequestException("Вы уже подписаны");
    }

    await this.userModel.findByIdAndUpdate(id, {
      $inc: { subscribers: 1 },
    });

    await this.userModel.findByIdAndUpdate(currUser.userId, {
      $push: { subscribedToUsers: targetUser },
    });

    return "Успех";
  }

  async unsubscribe(id: string, currUser: currUser) {
    const targetUser = await this.userModel.findById(id);

    if (!targetUser) {
      throw new NotFoundException("Пользователь не найден");
    }
    const currentUser = await this.userModel.findById(currUser.userId);
    const isSub = currentUser.subscribedToUsers.find(
      (user) => user._id === targetUser._id
    );

    if (!isSub) {
      throw new BadRequestException("Вы не подписаны");
    }

    await this.userModel.findByIdAndUpdate(id, {
      $inc: { subscribers: -1 },
    });

    await this.userModel.findByIdAndUpdate(currUser.userId, {
      $pull: { subscribedToUsers: new mongoose.Types.ObjectId(targetUser._id) },
    });

    return "Успех";
  }
}

