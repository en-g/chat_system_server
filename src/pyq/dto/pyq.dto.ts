import { IsArray, IsNotEmpty, IsNumber, IsNumberString, IsString } from 'class-validator'

export class PyqTidingsListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class FriendPyqTidingsListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string

  @IsNotEmpty()
  @IsNumberString()
  contactId: string
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
