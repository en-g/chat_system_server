import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDate } from 'class-validator'

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

export class RegisterInfo {
  @IsNotEmpty()
  @IsString()
  email: string

  @IsNotEmpty()
  @IsString()
  username: string

  @IsNotEmpty()
  @IsString()
  password: string

  @IsOptional()
  @IsString()
  verificationCode: string
}

export class RegisterUserInfo {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsString()
  nickname: string

  @IsNotEmpty()
  @IsString()
  avatarUrl: string

  @IsNotEmpty()
  @IsString()
  sex: string

  @IsNotEmpty()
  @IsDate()
  birthday: Date
}

export class RegisterUserRandomInfo {
  @IsNotEmpty()
  @IsNumber()
  userId: number
}
