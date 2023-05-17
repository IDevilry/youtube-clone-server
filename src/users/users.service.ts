/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserRegDto } from 'src/auth/dto/CreateUserRegDto';
import { User } from 'src/database/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find({}, { password: 0 });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: id }, { password: 0 });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async create(user: CreateUserRegDto): Promise<any> {
    const createdUser = await this.userModel.create(user);
    const { password, ...result } = createdUser.toObject();
    return result;
  }
}
