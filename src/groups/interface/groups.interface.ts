export interface GroupsListId {
  userId: string
}

export interface GroupInfoIds {
  userId: string
  groupId: string
}

export interface UpdateGroupRemarksInfo {
  userId: number
  groupId: number
  remarks: string
}

export interface AgreeAddGropId {
  noticeId: number
}

export interface RefuseAddGropId {
  noticeId: number
}

export interface CreateGroupInfo {
  leaderId: number
  name: string
  avatarUrl: string
  members: Array<number>
}
