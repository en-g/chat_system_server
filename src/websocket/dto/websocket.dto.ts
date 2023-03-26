import { IsNumber, IsOptional, IsString } from 'class-validator'

export class Clients {
  [key: number]: ClientItem
}

export class ClientItem {
  userId: number
  socket: any
  isConnect: boolean
}

export class ClientId {
  @IsNumber()
  userId: number
}

export class AddContactApplication {
  @IsNumber()
  fromId: number

  @IsNumber()
  toId: number

  @IsString()
  type: string

  @IsOptional()
  @IsString()
  message?: string

  @IsNumber()
  friendGroupId: number

  @IsOptional()
  @IsString()
  remarks?: string
}

export class AddGroupApplication {
  @IsNumber()
  fromId: number

  @IsNumber()
  toId: number

  @IsNumber()
  groupId: number

  @IsString()
  type: string

  @IsOptional()
  @IsString()
  message?: string
}
