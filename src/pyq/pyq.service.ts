import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { FriendPyqTidingsListId, PyqTidingsInfo, PyqTidingsListId } from './interface/pyq.interface'

@Injectable()
export class PyqService {
  constructor(private sequelize: Sequelize) {}

  async getPyqTidingsList(id: PyqTidingsListId) {
    const pyqTidingsListSelect = `
      SELECT 
        pt.id, pt.user_id, ui.nickname, ui.avatar_url avatarUrl, pt.content, 
        pt.createAt createTime, 
        IFNULL(ptif.pictures, JSON_ARRAY()) pictures, 
	      IFNULL(pcuif.comments, JSON_ARRAY()) comments, 
	      IFNULL(pttui.thumbs, JSON_ARRAY()) thumbs
      FROM pyqTidings pt
      INNER JOIN userInfo ui ON ui.user_id = pt.user_id
      LEFT JOIN (
        SELECT pti.pyqTidings_id, JSON_ARRAYAGG(
          JSON_OBJECT('id', pti.id, 'url', f.url)
        ) pictures
        FROM pyqTidingsImages pti 
        INNER JOIN files f ON f.id = pti.file_id
        GROUP BY pti.pyqTidings_id
      ) ptif ON ptif.pyqTidings_id = pt.id
      LEFT JOIN (
        SELECT pc.pyqTidings_id, JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pc.id, 'userId', pc.user_id, 'toId', pc.to_id, 
            'fromName', ui.nickname, 'toName', uii.nickname, 'content', pc.content
          )
        ) comments
        FROM pyqComments pc 
        INNER JOIN userInfo ui ON ui.user_id = pc.user_id
        LEFT JOIN userInfo uii ON uii.user_id = pc.to_id
        WHERE pc.user_id = :userId OR pc.user_id IN (
          SELECT f.friend_id FROM friends f WHERE f.user_id = :userId
        )
        GROUP BY pc.pyqTidings_id
      ) pcuif ON pcuif.pyqTidings_id = pt.id
      LEFT JOIN (
        SELECT ptt.pyqTidings_id, JSON_ARRAYAGG(
          JSON_OBJECT('userId', ptt.user_id, 'nickname', ui.nickname)
        ) thumbs
        FROM pyqTidingsThumbsUp ptt
        INNER JOIN userInfo ui ON ui.user_id = ptt.user_id
        WHERE ptt.user_id = :userId OR ptt.user_id IN (
          SELECT f.friend_id FROM friends f WHERE f.user_id = :userId
        )
        GROUP BY ptt.pyqTidings_id
      ) pttui ON pttui.pyqTidings_id = pt.id
      WHERE pt.user_id = :userId OR pt.user_id IN (
        SELECT f.friend_id FROM friends f WHERE f.user_id = :userId
      )
    `
    const result: any[] = await this.sequelize.query(pyqTidingsListSelect, {
      replacements: { ...id },
      type: QueryTypes.SELECT,
    })
    return result.reverse()
  }

  async getFriendPyqTidingsList(id: FriendPyqTidingsListId) {
    const friendPyqTidingsListSelect = `
      SELECT 
        pt.id, pt.user_id, ui.nickname, ui.avatar_url avatarUrl, pt.content, 
        pt.createAt createTime, 
        IFNULL(ptif.pictures, JSON_ARRAY()) pictures, 
	      IFNULL(pcuif.comments, JSON_ARRAY()) comments, 
	      IFNULL(pttui.thumbs, JSON_ARRAY()) thumbs
      FROM pyqTidings pt
      INNER JOIN userInfo ui ON ui.user_id = pt.user_id
      LEFT JOIN (
        SELECT pti.pyqTidings_id, JSON_ARRAYAGG(
          JSON_OBJECT('id', pti.id, 'url', f.url)
        ) pictures
        FROM pyqTidingsImages pti 
        INNER JOIN files f ON f.id = pti.file_id
        GROUP BY pti.pyqTidings_id
      ) ptif ON ptif.pyqTidings_id = pt.id
      LEFT JOIN (
        SELECT pc.pyqTidings_id, JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pc.id, 'userId', pc.user_id, 'toId', pc.to_id, 
            'fromName', ui.nickname, 'toName', uii.nickname, 'content', pc.content
          )
        ) comments
        FROM pyqComments pc 
        INNER JOIN userInfo ui ON ui.user_id = pc.user_id
        LEFT JOIN userInfo uii ON uii.user_id = pc.to_id
        WHERE pc.user_id = :userId OR pc.user_id IN (
          SELECT f.friend_id FROM friends f WHERE f.user_id = :userId
        )
        GROUP BY pc.pyqTidings_id
      ) pcuif ON pcuif.pyqTidings_id = pt.id
      LEFT JOIN (
        SELECT ptt.pyqTidings_id, JSON_ARRAYAGG(
          JSON_OBJECT('userId', ptt.user_id, 'nickname', ui.nickname)
        ) thumbs
        FROM pyqTidingsThumbsUp ptt
        INNER JOIN userInfo ui ON ui.user_id = ptt.user_id
        WHERE ptt.user_id = :userId OR ptt.user_id IN (
          SELECT f.friend_id FROM friends f WHERE f.user_id = :userId
        )
        GROUP BY ptt.pyqTidings_id
      ) pttui ON pttui.pyqTidings_id = pt.id
      WHERE pt.user_id = :contactId
    `
    const result = await this.sequelize.query(friendPyqTidingsListSelect, {
      replacements: { ...id },
      type: QueryTypes.SELECT,
    })
    return result.reverse()
  }

  async releasePyqTidings(info: PyqTidingsInfo) {
    const pyqContentInsert = `INSERT INTO pyqTidings (user_id, content) VALUES (:userId, :content)`
    const pyqPicturesInsert = `INSERT INTO pyqTidingsImages (pyqTidings_id, file_id) VALUES (?, ?)`
    const result = await this.sequelize.transaction(async (t) => {
      const pyqContentInsertRes = await this.sequelize.query(pyqContentInsert, {
        replacements: { ...info },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      if (!pyqContentInsertRes[1]) return false
      let res = true
      for (let i = 0; i < info.pictureIds.length; i++) {
        const pyqPicturesInsertRes = await this.sequelize.query(pyqPicturesInsert, {
          replacements: [pyqContentInsertRes[0], info.pictureIds[i]],
          type: QueryTypes.INSERT,
          transaction: t,
        })
        res = res && !!pyqPicturesInsertRes[1]
      }
      return res
    })
    return result
  }
}
