import { Injectable } from '@nestjs/common'
import { Sequelize } from 'sequelize-typescript'
import { AddContactApplication, AddGroupApplication } from './interface/websocket.interface'
import { QueryTypes } from 'sequelize'

@Injectable()
export class WebsocketService {
  constructor(private sequelize: Sequelize) {}

  async setContactNotice(info: AddContactApplication) {
    const contactNoticeSelect = `SELECT id FROM friendNotices WHERE from_id = :fromId AND to_id = :toId AND type = :type`
    const contactNoticeDelete = `DELETE FROM friendNotices WHERE id = :id`
    const contactNoticeInsert = `INSERT INTO friendNotices (from_id, to_id, type, message, friendGroup_id, remarks) VALUES (:fromId, :toId, :type, :message, :friendGroupId, :remarks)`
    const contactNoticeSelectRes: Array<any> = await this.sequelize.query(contactNoticeSelect, {
      replacements: { ...info },
      type: QueryTypes.SELECT,
    })
    if (contactNoticeSelectRes.length > 0) {
      await this.sequelize.query(contactNoticeDelete, {
        replacements: { id: contactNoticeSelectRes[0].id },
        type: QueryTypes.DELETE,
      })
    }
    const result = await this.sequelize.query(contactNoticeInsert, {
      replacements: { ...info },
      type: QueryTypes.INSERT,
    })
    return result
  }

  async getContactNoticeDetail(id: number) {
    const contactNoticeDetailSelect = `
      SELECT 
        fn.id, fn.from_id fromId, ui.nickname fromName, ui.avatar_url fromAvatarUrl, ui.signature fromSignature,
        fn.to_id toId, uii.nickname toName, uii.avatar_url toAvatarUrl, uii.signature toSignature, fn.type, 
        fn.message, fn.status, fn.createAt createTime
      FROM friendNotices fn
      INNER JOIN userInfo ui ON ui.user_id = fn.from_id
      INNER JOIN userInfo uii ON uii.user_id = fn.to_id
      WHERE fn.id = :id
    `
    const result: any = await this.sequelize.query(contactNoticeDetailSelect, {
      replacements: { id },
      type: QueryTypes.SELECT,
    })
    if (result[0]) {
      // result[0].createTime = result[0].createTime.toString()
    }
    return result[0]
  }

  async setGroupNotice(info: AddGroupApplication) {
    const groupNoticeSelect = `SELECT id FROM groupNotices WHERE from_id = :fromId AND group_id = :groupId AND type = :type`
    const groupNoticeDelete = `DELETE FROM groupNotices WHERE id = :id`
    const groupNoticeInsert = `INSERT INTO groupNotices (from_id, to_id, group_id, type, message) VALUES (:fromId, :toId, :groupId, :type, :message)`
    const groupNoticeSelectRes: Array<any> = await this.sequelize.query(groupNoticeSelect, {
      replacements: { ...info },
      type: QueryTypes.SELECT,
    })
    if (groupNoticeSelectRes.length > 0) {
      await this.sequelize.query(groupNoticeDelete, {
        replacements: { id: groupNoticeSelectRes[0].id },
        type: QueryTypes.DELETE,
      })
    }
    const result = await this.sequelize.query(groupNoticeInsert, {
      replacements: { ...info },
      type: QueryTypes.INSERT,
    })
    return result
  }

  async getGroupNoticeDetail(id: number) {
    const groupNoticeDetailSelect = `
      SELECT 
        gn.id, gn.from_id fromId, ui.nickname fromName, ui.avatar_url fromAvatarUrl, ui.signature fromSignature,
        gn.to_id toId, uii.nickname toName, uii.avatar_url toAvatarUrl, uii.signature toSignature, gn.group_id groupId, 
        cg.name groupName, cg.avatar_url groupAvatarUrl, gn.type, gn.message, gn.status, gn.createAt createTime
      FROM groupNotices gn
      INNER JOIN userInfo ui ON ui.user_id = gn.from_id
      INNER JOIN userInfo uii ON uii.user_id = gn.to_id
      INNER JOIN chatGroups cg ON cg.id = gn.group_id
      WHERE gn.id = :id
    `
    const result: any = await this.sequelize.query(groupNoticeDetailSelect, {
      replacements: { id },
      type: QueryTypes.SELECT,
    })
    if (result[0]) {
      // result[0].createTime = result[0].createTime.toString()
    }
    return result[0]
  }

  async updateUserLatestOnlineTime(userId: number) {
    const latestOnlineTimeDelete = `DELETE FROM latestOnlineTime WHERE user_id = :userId`
    const latestOnlineTimeInsert = `INSERT INTO latestOnlineTime (user_id) VALUES (:userId)`
    await this.sequelize.transaction(async (t) => {
      await this.sequelize.query(latestOnlineTimeDelete, {
        replacements: { userId },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      await this.sequelize.query(latestOnlineTimeInsert, {
        replacements: { userId },
        type: QueryTypes.INSERT,
        transaction: t,
      })
    })
  }

  async getOfflineChatMessage(userId: number) {
    const latestOnlineTimeSelect = `SELECT createAt onlineTime FROM latestOnlineTime WHERE user_id = :userId`
    const offlineFriendChatMessageSelect = `
      SELECT fcm.id, fcm.from_id fromId, fcm.to_id toId, 
        fcm.type, fcm.message, fcm.url, fcm.createAt createTime
      FROM friendChatMessages fcm
      WHERE fcm.to_id = :userId AND fcm.createAt >= :onlineTime
      ORDER BY fcm.createAt
    `
    const offlineGroupChatMessageSelect = `
      SELECT gcm.id, gcm.group_id groupId, gcm.send_id fromId, 
        gcm.type, gcm.message, gcm.url, gcm.createAt createTime
      FROM groupChatMessages gcm
      INNER JOIN user_group ug ON ug.group_id = gcm.group_id
      WHERE ug.user_id = :userId AND gcm.createAt >= :onlineTime
      ORDER BY gcm.createAt
    `
    const result = await this.sequelize.transaction(async (t) => {
      const latestOnlineTimeSelectRes: any[] = await this.sequelize.query(latestOnlineTimeSelect, {
        replacements: { userId },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      if (latestOnlineTimeSelectRes.length === 0) return {}
      const offlineFriendChatMessageSelectRes = await this.sequelize.query(offlineFriendChatMessageSelect, {
        replacements: { userId, onlineTime: latestOnlineTimeSelectRes[0].onlineTime },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      const offlineGroupChatMessageSelectRes = await this.sequelize.query(offlineGroupChatMessageSelect, {
        replacements: { userId, onlineTime: latestOnlineTimeSelectRes[0].onlineTime },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      return {
        contact: offlineFriendChatMessageSelectRes,
        group: offlineGroupChatMessageSelectRes,
      }
    })
    return result
  }
}
