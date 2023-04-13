import { Injectable } from '@nestjs/common'
import { EmotionList, UploadEmotion } from './interface/emotion.interface'
import { Sequelize } from 'sequelize-typescript'
import { QueryTypes } from 'sequelize'

@Injectable()
export class EmotionService {
  constructor(private readonly sequelize: Sequelize) {}

  async getEmotionList(id: EmotionList) {
    const emotionSelect = `
      SELECT e.id, f.url
      FROM emoticons e
      INNER JOIN files f ON f.id = e.file_id
      WHERE e.user_id = :userId
    `
    const result = await this.sequelize.query(emotionSelect, {
      replacements: { ...id },
      type: QueryTypes.SELECT,
    })
    return result
  }

  async uploadEmotion(ids: UploadEmotion) {
    const emotionSelect = `SELECT * FROM emoticons WHERE user_id = :userId AND file_id = :fileId`
    const emotionInsert = `INSERT INTO emoticons (user_id, file_id) VALUES (:userId, :fileId)`
    const emotionSelectRes = await this.sequelize.query(emotionSelect, {
      replacements: { ...ids },
      type: QueryTypes.SELECT,
    })
    if (emotionSelectRes.length > 0) return false
    const result = await this.sequelize.query(emotionInsert, {
      replacements: { ...ids },
      type: QueryTypes.INSERT,
    })
    return !!result[1]
  }
}
