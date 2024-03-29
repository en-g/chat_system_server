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

export class ThumbsUpLifeTidingsIds {
  @IsNotEmpty()
  @IsNumber()
  lifeTidingId: number

  @IsNotEmpty()
  @IsNumber()
  userId: number
}

export class CollectLifeTidingsIds {
  @IsNotEmpty()
  @IsNumber()
  lifeTidingId: number

  @IsNotEmpty()
  @IsNumber()
  userId: number
}

export class DeleteLifeTidingsId {
  @IsNotEmpty()
  @IsNumber()
  lifeTidingId: number
}

export class LifeTidingDetailId {
  @IsNotEmpty()
  @IsNumberString()
  lifeTidingId: string

  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class CommentLifeTidingsInfo {
  @IsNotEmpty()
  @IsNumber()
  lifeTidingId: number

  @IsNotEmpty()
  @IsNumber()
  fromId: number

  @IsNotEmpty()
  @IsNumber()
  toId: number

  @IsNotEmpty()
  @IsString()
  content: string
}

export class ReplyLifeTidingsInfo {
  @IsNotEmpty()
  @IsNumber()
  lifeTidingId: number

  @IsNotEmpty()
  @IsNumber()
  lifeCommentId: number

  @IsNotEmpty()
  @IsNumber()
  fromId: number

  @IsNotEmpty()
  @IsNumber()
  toId: number

  @IsNotEmpty()
  @IsString()
  content: string
}

export class ThumbsUpCommentIds {
  @IsNotEmpty()
  @IsNumber()
  lifeTidingId: number

  @IsNotEmpty()
  @IsNumber()
  lifeCommentId: number

  @IsNotEmpty()
  @IsNumber()
  userId: number
}

export class LifeMessageCountId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class RegardUserIds {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsNumber()
  regardId: number
}

export class FansListId {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}
