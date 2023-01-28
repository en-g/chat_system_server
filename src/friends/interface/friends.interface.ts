export interface FriendListId {
  userId: string
}

export interface FriendInfoIds {
  userId: string
  friendId: string
}

export interface UpdateFriendRemarksInfo {
  userId: number
  friendId: number
  remarks: string
}
