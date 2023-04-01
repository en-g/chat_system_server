import { IsNotEmpty, IsNumber, IsNumberString, IsString } from 'class-validator'

export class ContactNoticeListInfo {
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

export class GroupNoticeListInfo {
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

export class UnHandleNoticeInfo {
  @IsNotEmpty()
  @IsString()
  type: string

  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class ReadNoticeId {
  @IsNotEmpty()
  @IsNumber()
  noticeId: number
}
