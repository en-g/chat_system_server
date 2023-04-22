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
