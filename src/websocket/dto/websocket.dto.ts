import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class Clients {
  [key: number]: ClientItem
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
