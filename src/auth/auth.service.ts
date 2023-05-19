import { BadRequestException, HttpException, Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { User } from "../database/schemas/user.schema";
import { CreateUserRegDto } from "./dto/CreateUserRegDto";
import { CreateUserLoginDto } from "./dto/CreateUserLoginDto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { CreateGoogleAuthDto } from "./dto/CreateGoogleAuthDto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(
    email: string,
    password: string
  ): Promise<Omit<User, "password">> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    } else {
      return null;
    }
  }

  async login(
    user: CreateUserLoginDto
  ): Promise<{ user: Omit<User, "password">; access_token: string }> {
    const validateUser = await this.validateUser(user.email, user.password);

    if (!validateUser) {
      throw new BadRequestException();
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
    user: CreateUserRegDto
  ): Promise<{ user: Omit<User, "password">; access_token: string }> {
    const userExists = await this.usersService.findByEmail(user.email);
    if (userExists) {
      throw new HttpException(
        `Пользователь с почтой ${user.email} уже существует`,
        400
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

  async googleAuth(user: CreateGoogleAuthDto) {
    const userExists = await this.usersService.findByEmail(user.email);
    if (!userExists) {
      const newUser = await this.usersService.create<CreateGoogleAuthDto>({
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        withGoogle: true,
        emailVerified: user.emailVerified,
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
    const payload = {
      username: userExists.name,
      userId: String(userExists._id),
    };
    return {
      user: userExists,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

