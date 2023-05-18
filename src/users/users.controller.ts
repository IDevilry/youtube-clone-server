import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Request,
} from "@nestjs/common";
import { UsersService } from "./users.service";

import { CreateUserDto } from "./dto/CreateUserDto";

@Controller("users")
export class UsersController {
  constructor(readonly usersService: UsersService) {}

  @Get("/")
  async findAll() {
    return this.usersService.findAll();
  }

  @Get("/:id")
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Put("update/:id")
  async update(
    @Param("id") id: string,
    @Body() user: CreateUserDto,
    @Request() req
  ) {
    return this.usersService.update(id, user, req.user);
  }

  @Delete("delete/:id")
  async delete(@Param("id") id: string, @Request() req) {
    return this.usersService.delete(id, req.user);
  }

  @Get("sub/:id")
  async subscribe(@Param("id") id: string, @Request() req) {
    return this.usersService.subscribe(id, req.user);
  }

  @Get("unsub/:id")
  async unsubscribe(@Param("id") id: string, @Request() req) {
    return this.usersService.unsubscribe(id, req.user);
  }
}

