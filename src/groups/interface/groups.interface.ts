export interface GroupsListId {
  userId: string
}

export interface GroupInfoIds {
  userId: string
  groupId: string
}

export interface UpdateGroupNameInfo {
  userId: number
  groupId: number
  name: string
}

export interface UpdateGroupRemarksInfo {
  userId: number
  groupId: number
  remarks: string
}

export interface UpdateGroupNoticeInfo {
  userId: number
  groupId: number
  notice: string
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

export interface ExitGroup {
  userId: number
  groupId: number
}

export interface DismissGroup {
  leaderId: number
  groupId: number
}
