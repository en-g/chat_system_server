import { IsNotEmpty, IsNumberString } from 'class-validator'

export class GroupsListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class GroupInfoIds {
  @IsNotEmpty()
  @IsNumberString()
  userId: string

  @IsNotEmpty()
  @IsNumberString()
  groupId: string
}
