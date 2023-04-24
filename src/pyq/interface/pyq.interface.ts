export interface PyqTidingsListId {
  userId: string
}

export interface PyqTidingsListPage {
  pageNum: string
  pageSize: string
}

export interface FriendPyqTidingsListInfo {
  userId: string
  contactId: string
  pageNum: string
  pageSize: string
}

export interface PyqTidingsInfo {
  userId: number
  content: string
  pictureIds: Array<number>
}

export interface DeletePyqTidingsId {
  pyqTidingId: number
}

export interface ThumbsUpPyqTidingsIds {
  pyqTidingId: number
  userId: number
}

export interface SendPyqTidingsCommentInfo {
  pyqTidingId: number
  userId: number
  toId?: number
  content: string
}

export interface GetPyqMessaegesListId {
  userId: string
}
