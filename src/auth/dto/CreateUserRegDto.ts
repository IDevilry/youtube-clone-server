import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateUserRegDto {
  @IsNotEmpty({ message: "Поле не должно быть пустым" })
  @IsString({ message: "Поле должно быть строкой" })
  @IsEmail({}, { message: "Это не email" })
  email: string;

  @IsNotEmpty({ message: "Поле не должно быть пустым" })
  @IsString({ message: "Поле должно быть строкой" })
  @Length(6, 20, { message: `Длина пароля должна быть от 6 до 20 символов` })
  password: string;

  @IsNotEmpty({ message: "Поле не должно быть пустым" })
  @IsString({ message: "Поле должно быть строкой" })
  @Length(4, 16, { message: `Длина имени должна быть от 4 до 16 символов` })
  name: string;
}

