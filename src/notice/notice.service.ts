import { Injectable } from '@nestjs/common'
import { Sequelize } from 'sequelize-typescript'
import {
  ContactNoticeListInfo,
  GroupNoticeListInfo,
  ReadNoticeId,
  UnHandleNoticeInfo,
} from './interface/notice.interface'
import { QueryTypes } from 'sequelize'

@Injectable()
export class NoticeService {
  constructor(private readonly sequelize: Sequelize) {}

  async getContactNoticeList(info: ContactNoticeListInfo) {
    const contactNoticeListSelect = `
      SELECT fn.id, fn.from_id fromId, fn.to_id toId, ui.nickname fromName, ui.avatar_url fromAvatarUrl, 
        ui.signature fromSignature, fn.type, fn.message, fn.status, fn.createAt createTime
      FROM friendNotices fn
      INNER JOIN userInfo ui ON ui.user_id = fn.from_id
      WHERE fn.to_id = :userId
      ORDER BY fn.createAt DESC
    `
    const result = await this.sequelize.query(contactNoticeListSelect, {
      replacements: { ...info },
      type: QueryTypes.SELECT,
    })
    return {
      total: result.length,
      list: result.slice(
        (parseInt(info.pageNum) - 1) * parseInt(info.pageSize),
        (parseInt(info.pageNum) - 1) * parseInt(info.pageSize) + parseInt(info.pageSize),
      ),
    }
  }

  async getGroupNoticeList(info: GroupNoticeListInfo) {
    const groupNoticeListSelect = `
      SELECT gn.id, gn.from_id fromId, gn.to_id toId, gn.group_id groupId, ui.nickname fromName, ui.avatar_url fromAvatarUrl, 
        ui.signature fromSignature, cg.name groupName, gn.type, gn.message, gn.status, gn.createAt createTime
      FROM groupNotices gn
      INNER JOIN userInfo ui ON ui.user_id = gn.from_id
      INNER JOIN chatGroups cg ON cg.id = gn.group_id
      WHERE gn.to_id = :userId
      ORDER BY gn.createAt DESC
    `
    const result = await this.sequelize.query(groupNoticeListSelect, {
      replacements: { ...info },
      type: QueryTypes.SELECT,
    })
    return {
      total: result.length,
      list: result.slice(
        (parseInt(info.pageNum) - 1) * parseInt(info.pageSize),
        (parseInt(info.pageNum) - 1) * parseInt(info.pageSize) + parseInt(info.pageSize),
      ),
    }
  }

  async getUnHandleNotice(info: UnHandleNoticeInfo) {
    if (info.type === 'contact') {
      const unHandleNoticeSelect = `SELECT JSON_ARRAYAGG(id) ids FROM friendNotices WHERE to_id = :userId AND status = 0 GROUP BY to_id`
      const result = await this.sequelize.query(unHandleNoticeSelect, {
        replacements: { ...info },
        type: QueryTypes.SELECT,
      })
      return result[0]
    } else {
      const unHandleNoticeSelect = `SELECT JSON_ARRAYAGG(id) ids FROM groupNotices WHERE to_id = :userId AND status = 0 GROUP BY to_id`
      const result = await this.sequelize.query(unHandleNoticeSelect, {
        replacements: { ...info },
        type: QueryTypes.SELECT,
      })
      return result[0]
    }
  }

  async readNotice(id: ReadNoticeId) {
    const noticeSelect = `SELECT type FROM groupNotices WHERE id = :noticeId`
    const noticeUpdate = `UPDATE groupNotices SET status = 3 WHERE id = :noticeId`
    const noticeSelectRes: any[] = await this.sequelize.query(noticeSelect, {
      replacements: { ...id },
      type: QueryTypes.SELECT,
    })
    if (
      noticeSelectRes.length === 0 ||
      (noticeSelectRes[0].type !== 'exit' &&
        noticeSelectRes[0].type !== 'dismiss' &&
        noticeSelectRes[0].type !== 'create')
    )
      return false
    const noticeUpdateRes = await this.sequelize.query(noticeUpdate, {
      replacements: { ...id },
      type: QueryTypes.UPDATE,
    })
    return !!noticeUpdateRes[1]
  }
}
