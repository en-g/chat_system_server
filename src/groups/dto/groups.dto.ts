import { IsNotEmpty, IsNumberString } from 'class-validator'

export class GroupsListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}
