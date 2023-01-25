import { IsNotEmpty, IsString } from 'class-validator'

export class UploadPassWordCode {
  @IsNotEmpty()
  @IsString()
  email: string

  @IsNotEmpty()
  @IsString()
  username: string
}

export class RegisterCode {
  @IsNotEmpty()
  @IsString()
  email: string

  @IsNotEmpty()
  @IsString()
  username: string
}
