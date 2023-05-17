import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { VideosService } from "./videos.service";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateVideoDto } from "./dto/CreateVideoDto";

@Controller("videos")
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Get()
  async findAll() {
    return this.videosService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.videosService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  @Post("new")
  async create(@Body() video: CreateVideoDto) {
    return this.videosService.create(video);
  }

  @UseGuards(AuthGuard)
  @Delete("delete/:id")
  async delete(@Param("id") id: string, @Request() req) {
    return this.videosService.delete(id, req.user);
  }

  @UseGuards(AuthGuard)
  @Get("like/:id")
  async like(@Param("id") id: string, @Request() req) {
    return this.videosService.like(id, req.user);
  }

  @UseGuards(AuthGuard)
  @Get("dislike/:id")
  async dislike(@Param("id") id: string, @Request() req) {
    return this.videosService.dislike(id, req.user);
  }

  @Patch("view/:id")
  async addView(@Param("id") id: string) {
    return this.videosService.addView(id);
  }
}

