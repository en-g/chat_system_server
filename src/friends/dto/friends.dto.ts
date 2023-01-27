import { IsNotEmpty, IsNumberString } from 'class-validator'

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
