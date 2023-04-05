export interface ContactChatMessageInfo {
  fromId: number
  toId: number
  type: number
  message?: string
  url?: string
}

export interface GroupChatMessageInfo {
  groupId: number
  sendId: number
  type: number
  message?: string
  url?: string
}
