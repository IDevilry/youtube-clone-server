import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { VideosService } from "./videos.service";
import { CreateVideoDto } from "./dto/CreateVideoDto";
import { Public } from "../decorators/public.decorator";

@Controller("videos")
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Public()
  @Get()
  async findAll() {
    return this.videosService.findAll();
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.videosService.findOne(id);
  }

  @UsePipes(new ValidationPipe())
  @Post("new")
  async create(@Body() video: CreateVideoDto) {
    return this.videosService.create(video);
  }

  @Delete("delete/:id")
  async delete(@Param("id") id: string, @Request() req) {
    return this.videosService.delete(id, req.user);
  }

  @Patch("like/:id")
  async like(@Param("id") id: string, @Request() req) {
    return this.videosService.like(id, req.user);
  }

  @Patch("dislike/:id")
  async dislike(@Param("id") id: string, @Request() req) {
    return this.videosService.dislike(id, req.user);
  }

  @Public()
  @Patch("view/:id")
  async addView(@Param("id") id: string) {
    return this.videosService.addView(id);
  }
}

