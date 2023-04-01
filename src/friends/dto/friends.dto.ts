import { IsNotEmpty, IsNumber, IsNumberString, IsString } from 'class-validator'

export class FriendListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class FriendInfoIds {
  @IsNotEmpty()
  @IsNumberString()
  userId: string

  @IsNotEmpty()
  @IsNumberString()
  friendId: string
}

export class UpdateFriendRemarksInfo {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsNumber()
  friendId: number

  @IsNotEmpty()
  @IsString()
  remarks: string
}

export class SearchFriendAndGroupsByKeyword {
  @IsNotEmpty()
  @IsString()
  keyword: string

  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class AgreeAddContactInfo {
  @IsNotEmpty()
  @IsNumber()
  noticeId: number

  @IsNotEmpty()
  @IsNumber()
  friendGroupId: number

  @IsNotEmpty()
  @IsString()
  remarks: string
}

export class RefuseAddContactInfo {
  @IsNotEmpty()
  @IsNumber()
  noticeId: number
}
