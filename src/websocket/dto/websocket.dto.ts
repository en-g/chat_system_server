import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class Clients {
  [key: number]: ClientItem
}

export class GroupsMembers {
  [groupId: number]: Array<number>
}

export class ClientItem {
  userId: number
  socket: any
  isConnect: boolean
}

export class ClientId {
  @IsNotEmpty()
  @IsNumber()
  userId: number
}

export class AddContactApplication {
  @IsNotEmpty()
  @IsNumber()
  fromId: number

  @IsNotEmpty()
  @IsNumber()
  toId: number

  @IsNotEmpty()
  @IsString()
  type: string

  @IsOptional()
  @IsString()
  message?: string

  @IsNotEmpty()
  @IsNumber()
  friendGroupId: number

  @IsOptional()
  @IsString()
  remarks?: string
}

export interface AddContactSuccess {
  fromId: number
  toId: number
}

export interface EnterGroupSuccess {
  userId: number
  groupId: number
}

export interface DeleteChatMessageItemNotice {
  userId: number
  chatId: number
  type: string
}

export interface DeleteChatMessageItemNoticeId {
  userId: number
}

export class DeleteContactApplication {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsNumber()
  friendId: number
}

export class AddGroupApplication {
  @IsNotEmpty()
  @IsNumber()
  fromId: number

  @IsNotEmpty()
  @IsNumber()
  toId: number

  @IsNotEmpty()
  @IsNumber()
  groupId: number

  @IsNotEmpty()
  @IsString()
  type: string

  @IsOptional()
  @IsString()
  message?: string
}

export class CreateGroupApplication {
  userId: number
  groupId: number
  members: Array<number>
}

export class InviteGroupApplication {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsNumber()
  groupId: number

  @IsNotEmpty()
  @IsArray()
  inviteIds: Array<number>
}

export class ExitGroupApplication {
  @IsNotEmpty()
  @IsNumber()
  fromId: number

  @IsNotEmpty()
  @IsNumber()
  toId: number

  @IsNotEmpty()
  @IsNumber()
  groupId: number

  @IsNotEmpty()
  @IsString()
  type: string
}

export class DismissGroupApplication {
  @IsNotEmpty()
  @IsNumber()
  fromId: number

  @IsNotEmpty()
  @IsNumber()
  toId: number

  @IsNotEmpty()
  @IsNumber()
  groupId: number

  @IsNotEmpty()
  @IsString()
  type: string
}

export class EnterGroupInfo {
  userId: number
  groupId: number
}

export class UpdateContactListId {
  @IsNotEmpty()
  @IsNumber()
  userId: number
}

export class UpdateGroupListId {
  @IsNotEmpty()
  @IsNumber()
  userId: number
}

export class UpdateGroupInfoId {
  @IsNotEmpty()
  @IsNumber()
  groupId: number

  @IsNotEmpty()
  @IsNumber()
  userId: number
}

export class ChatMessageInfo {
  @IsNotEmpty()
  @IsNumber()
  fromId: number

  @IsOptional()
  @IsNumber()
  toId: number

  @IsOptional()
  @IsNumber()
  groupId: number

  @IsNotEmpty()
  @IsNumber()
  type: number

  @IsOptional()
  @IsString()
  message: string

  @IsOptional()
  @IsString()
  url: string

  @IsNotEmpty()
  @IsBoolean()
  isContact: boolean
}

export class UpdateLifeMessageCountId {
  @IsNotEmpty()
  @IsNumber()
  userId: number
}

export class UpdatePyqMessageCountId {
  @IsNotEmpty()
  @IsNumber()
  userId: number
}
