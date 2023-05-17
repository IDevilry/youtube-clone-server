import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserRegDto } from './dto/CreateUserRegDto';
import { CreateUserLoginDto } from './dto/CreateUserLoginDto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() user: CreateUserLoginDto) {
    return this.authService.login(user);
  }

  @UsePipes(new ValidationPipe())
  @Post('register')
  async register(@Body() user: CreateUserRegDto) {
    return this.authService.register(user);
  }
}
