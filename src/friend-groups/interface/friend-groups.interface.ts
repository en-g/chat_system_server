export interface FriendGroupListId {
  userId: string
}

export interface AddFriendGroup {
  userId: number
  name: string
}

export interface DeleteFriendGroup {
  userId: number
  friendGroupId: number
  newId?: number
}

export interface UpdateFriendGroup {
  userId: number
  friendGroupId: number
  name: string
}

export interface UpdateContactFriendGroup {
  userId: number
  friendGroupId: number
  friendId: number
}
