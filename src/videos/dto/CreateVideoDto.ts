import { IsArray, IsString, IsUrl, Length } from "class-validator";

export class CreateVideoDto {
  user: string;
  @IsString()
  @Length(4, 30, { message: "Название должно быть длиной от 4 до 30 символов" })
  title: string;
  @IsString()
  @Length(1, 250, {
    message: "Описание должно быть длиной от 1 до 250 символов",
  })
  description: string;
  @IsString()
  thumbnail: string;
  @IsUrl()
  url: string;
  @IsArray()
  tags: string[];
}
