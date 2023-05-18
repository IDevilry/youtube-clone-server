import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "../decorators/Public.decorator";

import { type CreateUserRegDto } from "./dto/CreateUserRegDto";
import { type CreateUserLoginDto } from "./dto/CreateUserLoginDto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  async login(@Body() user: CreateUserLoginDto) {
    return this.authService.login(user);
  }

  @Public()
  @UsePipes(new ValidationPipe())
  @Post("register")
  async register(@Body() user: CreateUserRegDto) {
    return this.authService.register(user);
  }
}

