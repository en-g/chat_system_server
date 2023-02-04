export interface PyqTidingsListId {
  userId: string
}

export interface FriendPyqTidingsListId {
  userId: string
  contactId: string
}

export interface PyqTidingsInfo {
  userId: string
  content: string
  pictureIds: Array<number>
}
