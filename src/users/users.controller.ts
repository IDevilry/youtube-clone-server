import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateUserDto } from "./dto/CreateUserDto";

@Controller("users")
export class UsersController {
  constructor(readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get("/")
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get("/:id")
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Put("update/:id")
  async update(
    @Param("id") id: string,
    @Body() user: CreateUserDto,
    @Request() req
  ) {
    return this.usersService.update(id, user, req.user);
  }

  @UseGuards(AuthGuard)
  @Delete("delete/:id")
  async delete(@Param("id") id: string, @Request() req) {
    return this.usersService.delete(id, req.user);
  }

  @UseGuards(AuthGuard)
  @Get("sub/:id")
  async subscribe(@Param("id") id: string, @Request() req) {
    return this.usersService.subscribe(id, req.user);
  }

  @UseGuards(AuthGuard)
  @Get("unsub/:id")
  async unsubscribe(@Param("id") id: string, @Request() req) {
    return this.usersService.unsubscribe(id, req.user);
  }
}

