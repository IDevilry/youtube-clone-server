import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { VideosModule } from './videos/videos.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    DatabaseModule,
    UsersModule,
    CommentsModule,
    VideosModule,
    AuthModule,
  ],
})
export class AppModule {}
