export interface GroupsListId {
  userId: string
}

export interface GroupInfoIds {
  userId: string
  groupId: string
}

export class UpdateGroupRemarksInfo {
  userId: number
  groupId: number
  remarks: string
}
