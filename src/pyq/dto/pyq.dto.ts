import { IsArray, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator'

export class PyqTidingsListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class PyqTidingsListPage {
  @IsNotEmpty()
  @IsNumberString()
  pageNum: string

  @IsNotEmpty()
  @IsNumberString()
  pageSize: string
}

export class FriendPyqTidingsListInfo {
  @IsNotEmpty()
  @IsNumberString()
  userId: string

  @IsNotEmpty()
  @IsNumberString()
  contactId: string

  @IsNotEmpty()
  @IsNumberString()
  pageNum: string

  @IsNotEmpty()
  @IsNumberString()
  pageSize: string
}

export class PyqTidingsInfo {
  @IsNotEmpty()
  @IsNumber()
  userId: string

  @IsNotEmpty()
  @IsString()
  content: string

  @IsNotEmpty()
  @IsArray()
  pictureIds: Array<number>
}
