import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UsePipes,
  ValidationPipe,
  Query,
} from "@nestjs/common";
import { VideosService } from "./videos.service";
import { CreateVideoDto } from "./dto/CreateVideoDto";
import { Public } from "../decorators/public.decorator";

@Controller("videos")
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Public()
  @Get()
  async findAll(
    @Query("page", ParseIntPipe) page: number,
    @Query("limit", ParseIntPipe) limit: number
  ) {
    return this.videosService.findAll(page, limit);
  }

  @Public()
  @Get("find/:id")
  async findOne(@Param("id") id: string) {
    return this.videosService.findOne(id);
  }

  @Get("subs")
  async getSubs(
    @Request() req,
    @Query("page", ParseIntPipe) page: number,
    @Query("limit", ParseIntPipe) limit: number
    ) {
    return this.videosService.findSubs(req.user, page, limit);
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

