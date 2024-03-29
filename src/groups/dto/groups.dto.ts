import { IsArray, IsNotEmpty, IsNumber, IsNumberString, IsString } from 'class-validator'

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

export class UpdateGroupNameInfo {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsNumber()
  groupId: number

  @IsNotEmpty()
  @IsString()
  name: string
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

export class UpdateGroupNoticeInfo {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsNumber()
  groupId: number

  @IsNotEmpty()
  @IsString()
  notice: string
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

export class CreateGroupInfo {
  @IsNotEmpty()
  @IsNumber()
  leaderId: number

  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  avatarUrl: string

  @IsNotEmpty()
  @IsArray()
  members: Array<number>
}

export class ExitGroup {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsNumber()
  groupId: number
}

export class DismissGroup {
  @IsNotEmpty()
  @IsNumber()
  leaderId: number

  @IsNotEmpty()
  @IsNumber()
  groupId: number
}
