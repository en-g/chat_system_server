import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class ContactChatMessageInfo {
  @IsNotEmpty()
  @IsNumber()
  fromId: number

  @IsNotEmpty()
  @IsNumber()
  toId: number

  @IsNotEmpty()
  @IsNumber()
  type: number

  @IsOptional()
  @IsString()
  message: string

  @IsOptional()
  @IsString()
  url: string
}

export class GroupChatMessageInfo {
  @IsNotEmpty()
  @IsNumber()
  groupId: number

  @IsNotEmpty()
  @IsNumber()
  sendId: number

  @IsNotEmpty()
  @IsNumber()
  type: number

  @IsOptional()
  @IsString()
  message: string

  @IsOptional()
  @IsString()
  url: string
}
