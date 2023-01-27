import { IsNotEmpty, IsNumberString } from 'class-validator'

export class FriendListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}
