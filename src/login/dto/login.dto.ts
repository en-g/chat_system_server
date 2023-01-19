import { IsNotEmpty, IsString, IsOptional } from 'class-validator'

export class LoginInfo {
  @IsNotEmpty()
  @IsString()
  username: string

  @IsNotEmpty()
  @IsString()
  password: string
}

export class PassInfo {
  @IsNotEmpty()
  @IsString()
  email: string

  @IsNotEmpty()
  @IsString()
  username: string

  @IsNotEmpty()
  @IsString()
  newPass: string

  @IsOptional()
  @IsString()
  verificationCode: string
}
