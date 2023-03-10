import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import {
  DeletePyqTidingsId,
  FriendPyqTidingsListInfo,
  PyqTidingsInfo,
  PyqTidingsListId,
  PyqTidingsListPage,
  SendPyqTidingsCommentInfo,
  ThumbsUpPyqTidingsIds,
} from './interface/pyq.interface'

@Injectable()
export class PyqService {
  constructor(private sequelize: Sequelize) {}

  async getPyqTidingsList(id: PyqTidingsListId, page: PyqTidingsListPage) {
    const pyqTidingsListSelect = `
      SELECT 
        pt.id, pt.user_id userId, ui.nickname, ui.avatar_url avatarUrl, pt.content, 
        pt.createAt createTime, IF(pttt.isThumbsUp, 1, 0) isThumbsUp,
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
      LEFT JOIN (
        SELECT ptt.pyqTidings_id, COUNT(*) isThumbsUp
        FROM pyqTidingsThumbsUp ptt
        WHERE ptt.user_id = :userId
        GROUP BY ptt.pyqTidings_id
      ) pttt ON pttt.pyqTidings_id = pt.id
      WHERE pt.user_id = :userId OR pt.user_id IN (
        SELECT f.friend_id FROM friends f WHERE f.user_id = :userId
      )
      ORDER BY pt.createAt DESC
    `
    const result: any[] = await this.sequelize.query(pyqTidingsListSelect, {
      replacements: { ...id },
      type: QueryTypes.SELECT,
    })
    return {
      total: result.length,
      list: result.slice(
        (parseInt(page.pageNum) - 1) * parseInt(page.pageSize),
        (parseInt(page.pageNum) - 1) * parseInt(page.pageSize) + parseInt(page.pageSize),
      ),
    }
  }

  async getFriendPyqTidingsList(info: FriendPyqTidingsListInfo) {
    const friendPyqTidingsListSelect = `
      SELECT 
        pt.id, pt.user_id userId, ui.nickname, ui.avatar_url avatarUrl, pt.content, 
        pt.createAt createTime, IF(pttt.isThumbsUp, 1, 0) isThumbsUp,
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
      LEFT JOIN (
        SELECT ptt.pyqTidings_id, COUNT(*) isThumbsUp
        FROM pyqTidingsThumbsUp ptt
        WHERE ptt.user_id = :userId
        GROUP BY ptt.pyqTidings_id
      ) pttt ON pttt.pyqTidings_id = pt.id
      WHERE pt.user_id = :contactId
      ORDER BY pt.createAt DESC
    `
    const result = await this.sequelize.query(friendPyqTidingsListSelect, {
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

  async deletePyqTiding(id: DeletePyqTidingsId) {
    const pyqTidingDelete = `DELETE FROM pyqTidings WHERE id = :pyqTidingId`
    const pyqTidingImagesDelete = `DELETE FROM pyqTidingsImages WHERE pyqTidings_id = :pyqTidingId`
    const pyqTidingCommentsDelete = `DELETE FROM pyqComments WHERE pyqTidings_id = :pyqTidingId`
    const pyqTidingThumbsDelete = `DELETE FROM pyqTidingsThumbsUp WHERE pyqTidings_id = :pyqTidingId`
    const result = await this.sequelize.transaction(async (t) => {
      await this.sequelize.query(pyqTidingDelete, {
        replacements: { ...id },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      await this.sequelize.query(pyqTidingImagesDelete, {
        replacements: { ...id },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      await this.sequelize.query(pyqTidingCommentsDelete, {
        replacements: { ...id },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      await this.sequelize.query(pyqTidingThumbsDelete, {
        replacements: { ...id },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      return true
    })
    return result
  }

  async thumsUpTiding(ids: ThumbsUpPyqTidingsIds) {
    const tidingsThumbsUpInsert = `INSERT INTO pyqTidingsThumbsUp (pyqTidings_id, user_id) VALUES (:pyqTidingId, :userId)`
    const result = await this.sequelize.query(tidingsThumbsUpInsert, {
      replacements: { ...ids },
      type: QueryTypes.INSERT,
    })
    return !!result[1]
  }

  async cancleThumsUpTiding(ids: ThumbsUpPyqTidingsIds) {
    const tidingsThumbsUpDelete = `DELETE FROM pyqTidingsThumbsUp WHERE pyqTidings_id = :pyqTidingId AND user_id = :userId`
    const result = await this.sequelize.query(tidingsThumbsUpDelete, {
      replacements: { ...ids },
      type: QueryTypes.DELETE,
    })
    return result
  }

  async sendTidingComment(info: SendPyqTidingsCommentInfo) {
    const toTidingCommentInsert = `INSERT INTO pyqComments (pyqTidings_id, user_id, content) VALUES (:pyqTidingId, :userId, :content)`
    const toUserCommentInsert = `INSERT INTO pyqComments (pyqTidings_id, user_id, to_id, content) VALUES (:pyqTidingId, :userId, :toId, :content)`
    if (info.toId) {
      const result = await this.sequelize.query(toUserCommentInsert, {
        replacements: { ...info },
        type: QueryTypes.INSERT,
      })
      return {
        status: !!result[1],
        id: result[0],
      }
    } else {
      const result = await this.sequelize.query(toTidingCommentInsert, {
        replacements: { ...info },
        type: QueryTypes.INSERT,
      })
      return {
        status: !!result[1],
        id: result[0],
      }
    }
  }
}
