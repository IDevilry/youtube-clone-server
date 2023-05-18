import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "../decorators/public.decorator";

import { CreateUserRegDto } from "./dto/CreateUserRegDto";
import { CreateUserLoginDto } from "./dto/CreateUserLoginDto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  async login(@Body() createUserLoginDto: CreateUserLoginDto) {
    return this.authService.login(createUserLoginDto);
  }

  @Public()
  @Post("register")
  async register(@Body() createUserRegDto: CreateUserRegDto) {
    return this.authService.register(createUserRegDto);
  }
}

