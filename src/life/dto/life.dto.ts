import { IsArray, IsNotEmpty, IsNumber, IsNumberString, IsString } from 'class-validator'

export class GetNewLifeTidingsListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string

  @IsNotEmpty()
  @IsNumberString()
  pageNum: string

  @IsNotEmpty()
  @IsNumberString()
  pageSize: string
}

export class GetUserLifeTidingsListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class GetUserLifeTidingsListInfo {
  @IsNotEmpty()
  @IsNumberString()
  selfId: string

  @IsNotEmpty()
  @IsNumberString()
  pageNum: string

  @IsNotEmpty()
  @IsNumberString()
  pageSize: string
}

export class GetUserCenterInfo {
  @IsNotEmpty()
  @IsNumberString()
  userId: string

  @IsNotEmpty()
  @IsNumberString()
  selfId: string
}

export class GetRegardListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class GetMessageListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class GetCollectionListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class LifeTidingsInfo {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsString()
  content: string

  @IsNotEmpty()
  @IsArray()
  pictureIds: Array<number>
}
