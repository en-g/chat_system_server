import { Injectable } from '@nestjs/common'
import { Sequelize } from 'sequelize-typescript'
import { ContactChatMessageInfo, GroupChatMessageInfo } from './interface/message.interface'
import { QueryTypes } from 'sequelize'

@Injectable()
export class MessageService {
  constructor(private readonly sequelize: Sequelize) {}

  async saveContactChatMessage(info: ContactChatMessageInfo) {
    const contactChatMessage = `INSERT INTO friendChatMessages (from_id, to_id, type, message, url) VALUES (:fromId, :toId, :type, :message, :url)`
    const contactChatMessageSelect = `
      SELECT fcm.id, fcm.from_id fromId, fcm.to_id toId, 
        fcm.type, fcm.message, fcm.url, fcm.createAt createTime
      FROM friendChatMessages fcm
      WHERE fcm.id = :id
    `
    const result = await this.sequelize.transaction(async (t) => {
      const contactChatMessageRes = await this.sequelize.query(contactChatMessage, {
        replacements: { ...info },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      if (!contactChatMessageRes[1]) return { status: 0, chatMessage: null }
      const contactChatMessageSelectRes = await this.sequelize.query(contactChatMessageSelect, {
        replacements: { id: contactChatMessageRes[0] },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      return { status: 1, chatMessage: contactChatMessageSelectRes[0] }
    })
    return result
  }

  async saveGroupChatMessage(info: GroupChatMessageInfo) {
    const groupChatMessage = `INSERT INTO groupChatMessages (group_id, send_id, type, message, url) VALUES (:groupId, :sendId, :type, :message, :url)`
    const groupChatMessageSelect = `
      SELECT gcm.id, gcm.group_id groupId, gcm.send_id fromId, 
        gcm.type, gcm.message, gcm.url, gcm.createAt createTime
      FROM groupChatMessages gcm
      WHERE gcm.id = :id
    `
    const result = await this.sequelize.transaction(async (t) => {
      const groupChatMessageRes = await this.sequelize.query(groupChatMessage, {
        replacements: { ...info },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      if (!groupChatMessageRes[1]) return { status: 0, chatMessage: null }
      const groupChatMessageSelectRes = await this.sequelize.query(groupChatMessageSelect, {
        replacements: { id: groupChatMessageRes[0] },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      return { status: 1, chatMessage: groupChatMessageSelectRes[0] }
    })
    return result
  }
}
