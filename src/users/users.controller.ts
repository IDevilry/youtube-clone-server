import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Request,
} from "@nestjs/common";
import { UsersService } from "./users.service";

import { UpdateUserDto } from "./dto/UpdateUser.dto";

@Controller("users")
export class UsersController {
  constructor(readonly usersService: UsersService) {}

  @Get("/")
  async findAll(
    @Query("limit", ParseIntPipe) limit: number,
    @Query("page", ParseIntPipe) page: number
  ) {
    return this.usersService.findAll(limit, page);
  }

  @Get("/find/:id")
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Get("me")
  async findMe(@Request() req) {
    return this.usersService.findMe(req.user);
  }

  @Put("update/:id")
  async update(
    @Param("id") id: string,
    @Body() user: UpdateUserDto,
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

