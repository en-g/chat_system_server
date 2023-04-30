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

export interface SearchFriendAndGroupsByKeyword {
  keyword: string
  userId: string
}

export interface AgreeAddContactInfo {
  noticeId: number
  friendGroupId: number
  remarks: string
}

export interface RefuseAddContactInfo {
  noticeId: number
}

export interface GetAllContactInfo {
  userId: string
}

export interface DeleteContact {
  userId: number
  friendId: number
}

export interface ContactListAboutGroup {
  userId: string
  groupId: string
}

export interface SearchFriendsGroupsListInfo {
  userId: string
  keyword: string
}
