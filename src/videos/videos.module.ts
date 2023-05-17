import { Module } from "@nestjs/common";
import { VideosService } from "./videos.service";
import { VideosController } from "./videos.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { VideoSchema } from "src/database/schemas/video.schema";
import { UserSchema } from "src/database/schemas/user.schema";

@Module({
  providers: [VideosService],
  controllers: [VideosController],
  imports: [
    MongooseModule.forFeature([
      { name: "Video", schema: VideoSchema },
      { name: "User", schema: UserSchema },
    ]),
  ],
})
export class VideosModule {}

