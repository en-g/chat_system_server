export interface GetNewLifeTidingsListId {
  userId: string
  pageNum: string
  pageSize: string
}

export interface GetUserCenterInfo {
  userId: string
  selfId: string
}

export interface GetUserLifeTidingsListId {
  userId: string
}

export interface GetUserLifeTidingsListInfo {
  selfId: string
  pageNum: string
  pageSize: string
}

export interface LifeTidingsInfo {
  userId: number
  title: string
  content: string
  pictureIds: Array<number>
}

export interface GetRegardListId {
  userId: string
}

export interface GetMessageListId {
  userId: string
}

export interface GetCollectionListId {
  userId: string
}

export interface ThumbsUpLifeTidingsIds {
  lifeTidingId: number
  userId: number
}

export interface CollectLifeTidingsIds {
  lifeTidingId: number
  userId: number
}

export interface DeleteLifeTidingsId {
  lifeTidingId: number
}

export interface LifeTidingDetailId {
  lifeTidingId: string
  userId: string
}

export interface CommentLifeTidingsInfo {
  lifeTidingId: number
  fromId: number
  toId: number
  content: string
}

export interface ReplyLifeTidingsInfo {
  lifeTidingId: number
  lifeCommentId: number
  fromId: number
  toId: number
  content: string
}

export interface ThumbsUpCommentIds {
  lifeTidingId: number
  lifeCommentId: number
  userId: number
}

export interface LifeMessageCountId {
  userId: string
}

export interface RegardUserIds {
  userId: number
  regardId: number
}

export interface FansListId {
  userId: string
}
