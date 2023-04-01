import { IsNotEmpty, IsNumber, IsNumberString, IsString } from 'class-validator'

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

export class UpdateGroupRemarksInfo {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsNumber()
  groupId: number

  @IsNotEmpty()
  @IsString()
  remarks: string
}

export class AgreeAddGropId {
  @IsNotEmpty()
  @IsNumber()
  noticeId: number
}

export class RefuseAddGropId {
  @IsNotEmpty()
  @IsNumber()
  noticeId: number
}
