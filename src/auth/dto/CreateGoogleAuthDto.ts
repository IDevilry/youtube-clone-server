export class CreateGoogleAuthDto {
  readonly email: string;
  readonly name: string;
  readonly profileImage: string;
  readonly withGoogle: true;
  readonly emailVerified: boolean;
}
