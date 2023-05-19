import { IsEmail, IsOptional, IsString, IsUrl, Length } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsUrl()
  readonly profileImage: string;

  @IsOptional()
  @IsString({ message: "Поле должно быть строкой" })
  @IsEmail({}, { message: "Это не email" })
  readonly email?: string;

  @IsOptional()
  @IsString({ message: "Поле должно быть строкой" })
  @Length(6, 20, { message: `Длина пароля должна быть от 6 до 20 символов` })
  readonly password?: string;

  @IsOptional()
  @IsString({ message: "Поле должно быть строкой" })
  @Length(4, 16, { message: `Длина имени должна быть от 4 до 16 символов` })
  readonly name?: string;
}
