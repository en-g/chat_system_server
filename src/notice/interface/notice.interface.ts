export interface ContactNoticeListInfo {
  userId: string
  pageNum: string
  pageSize: string
}

export interface GroupNoticeListInfo {
  userId: string
  pageNum: string
  pageSize: string
}

export interface UnHandleNoticeInfo {
  type: string
  userId: string
}

export interface ReadNoticeId {
  noticeId: number
}
