import { IsNotEmpty, IsString } from 'class-validator'

export class LoginInfo {
  @IsNotEmpty()
  @IsString()
  username: string

  @IsNotEmpty()
  @IsString()
  password: string
}
