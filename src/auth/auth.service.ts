import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/database/schemas/user.schema';
import { type CreateUserRegDto } from './dto/CreateUserRegDto';
import { type CreateUserLoginDto } from './dto/CreateUserLoginDto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      user.password = undefined;
      return user;
    } else {
      return null;
    }
  }

  async login(
    user: CreateUserLoginDto,
  ): Promise<{ user: User; access_token: string }> {
    const validateUser = await this.validateUser(user.email, user.password);

    if (!validateUser) {
      throw new UnauthorizedException();
    }
    const payload = {
      username: validateUser.name,
      userId: String(validateUser._id),
    };
    return {
      user: validateUser,
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(
    user: CreateUserRegDto,
  ): Promise<{ user: User; access_token: string }> {
    const userExists = await this.usersService.findByEmail(user.email);
    if (userExists) {
      throw new HttpException(
        `Пользователь с почтой ${user.email} уже существует`,
        400,
      );
    }
    const hashedPass = await bcrypt.hash(user.password, 10);
    const newUser = await this.usersService.create({
      password: hashedPass,
      name: user.name,
      email: user.email,
    });

    const payload = {
      username: newUser.name,
      userId: String(newUser._id),
    };
    return {
      user: newUser,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
