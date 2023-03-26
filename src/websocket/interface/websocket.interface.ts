export interface AddContactApplication {
  fromId: number
  toId: number
  type: string
  message?: string
  friendGroupId: number
  remarks?: string
}

export class AddGroupApplication {
  fromId: number
  toId: number
  groupId: number
  type: string
  message?: string
}
