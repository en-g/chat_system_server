import { Injectable } from '@nestjs/common'
import { Sequelize } from 'sequelize-typescript'
import { ContactChatMessageInfo, GroupChatMessageInfo } from './interface/message.interface'
import { QueryTypes } from 'sequelize'

@Injectable()
export class MessageService {
  constructor(private readonly sequelize: Sequelize) {}

  async saveContactChatMessage(info: ContactChatMessageInfo) {
    const contactChatMessage = `INSERT INTO friendChatMessages (from_id, to_id, type, message, url) VALUES (:fromId, :toId, :type, :message, :url)`
    const result = await this.sequelize.query(contactChatMessage, {
      replacements: { ...info },
      type: QueryTypes.INSERT,
    })
    return !!result[1]
  }

  async saveGroupChatMessage(info: GroupChatMessageInfo) {
    const groupChatMessage = `INSERT INTO groupChatMessages (group_id, send_id, type, message, url) VALUES (:groupId, :sendId, :type, :message, :url)`
    const result = await this.sequelize.query(groupChatMessage, {
      replacements: { ...info },
      type: QueryTypes.INSERT,
    })
    return !!result[1]
  }
}
