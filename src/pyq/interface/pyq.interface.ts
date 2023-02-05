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
  userId: string
  content: string
  pictureIds: Array<number>
}
