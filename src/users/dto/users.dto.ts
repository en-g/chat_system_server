import { IsNotEmpty, IsNumber, IsNumberString, IsString } from 'class-validator'

export class PersonalInfoId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class PersonalInfo {
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
  @IsString()
  birthday: string

  @IsNotEmpty()
  @IsString()
  signature: string

  @IsNotEmpty()
  @IsString()
  email: string
}
