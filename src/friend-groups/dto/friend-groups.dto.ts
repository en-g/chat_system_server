import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator'

export class FriendGroupListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class AddFriendGroup {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsString()
  name: string
}

export class DeleteFriendGroup {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsNumber()
  friendGroupId: number

  @IsOptional()
  @IsNumber()
  newId: number
}

export class UpdateFriendGroup {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsNumber()
  friendGroupId: number

  @IsOptional()
  @IsString()
  name: string
}
