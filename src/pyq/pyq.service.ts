import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import {
  DeletePyqTidingsId,
  FriendPyqTidingsListInfo,
  GetPyqMessaegesListId,
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
    const commentSelect = `
      SELECT pc.id, pc.user_id userId, pc.to_id toId, ui.nickname fromName, uii.nickname toName, pc.content
      FROM pyqComments pc
      INNER JOIN userInfo ui ON ui.user_id = pc.user_id
      LEFT JOIN userInfo uii ON uii.user_id = pc.to_id
      WHERE (pc.user_id = :userId OR pc.user_id IN (
        SELECT f.friend_id FROM friends f WHERE f.user_id = :userId
      )) AND pc.pyqTidings_id = :pyqTidingsId
			ORDER BY pc.createAt
    `
    const result = await this.sequelize.transaction(async (t) => {
      const pyqTidingsListSelectRes: any[] = await this.sequelize.query(pyqTidingsListSelect, {
        replacements: { ...id },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      for (const tiding of pyqTidingsListSelectRes) {
        const commentSelectRes = await this.sequelize.query(commentSelect, {
          replacements: { userId: id.userId, pyqTidingsId: tiding.id },
          type: QueryTypes.SELECT,
          transaction: t,
        })
        tiding['comments'] = commentSelectRes
      }
      return pyqTidingsListSelectRes
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
    const tidingSelect = `SELECT user_id userId FROM pyqTidings WHERE id = :pyqTidingId`
    const pyqMessageInsert = `INSERT INTO pyqMessages (user_id, thumbsUp_id, type) VALUES (:userId, :thumbsUpId, 3)`
    const result = await this.sequelize.transaction(async (t) => {
      const tidingsThumbsUpInsertRes = await this.sequelize.query(tidingsThumbsUpInsert, {
        replacements: { ...ids },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      if (!tidingsThumbsUpInsertRes[1]) return false
      const tidingSelectRes: any[] = await this.sequelize.query(tidingSelect, {
        replacements: { pyqTidingId: ids.pyqTidingId },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      if (tidingSelectRes[0] && tidingSelectRes[0].userId !== ids.userId) {
        await this.sequelize.query(pyqMessageInsert, {
          replacements: { userId: tidingSelectRes[0].userId, thumbsUpId: tidingsThumbsUpInsertRes[0] },
          type: QueryTypes.INSERT,
          transaction: t,
        })
      }
      return !!tidingsThumbsUpInsertRes[1]
    })
    return result
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
    const tidingSelect = `SELECT user_id userId FROM pyqTidings WHERE id = :pyqTidingId`
    const toTidingMessageInsert = `INSERT INTO pyqMessages (user_id, comment_id, type) VALUES (:userId, :commentId, 1)`
    const toUserMessageInsert = `INSERT INTO pyqMessages (user_id, comment_id, type) VALUES (:userId, :commentId, 2)`
    if (info.toId) {
      const result = await this.sequelize.transaction(async (t) => {
        const toUserCommentInsertRes = await this.sequelize.query(toUserCommentInsert, {
          replacements: { ...info },
          type: QueryTypes.INSERT,
          transaction: t,
        })
        if (!toUserCommentInsertRes[1]) return { status: !!toUserCommentInsertRes[1], id: toUserCommentInsertRes[0] }
        const toUserMessageInsertRes = await this.sequelize.query(toUserMessageInsert, {
          replacements: { userId: info.toId, commentId: toUserCommentInsertRes[0] },
          type: QueryTypes.INSERT,
          transaction: t,
        })
        return { status: !!toUserCommentInsertRes[1] && !!toUserMessageInsertRes[1], id: toUserCommentInsertRes[0] }
      })
      return result
    } else {
      const result = await this.sequelize.transaction(async (t) => {
        const toTidingCommentInsertRes = await this.sequelize.query(toTidingCommentInsert, {
          replacements: { ...info },
          type: QueryTypes.INSERT,
        })
        if (!toTidingCommentInsert[1]) return { status: !!toTidingCommentInsert[1], id: toTidingCommentInsert[0] }
        const tidingSelectRes: any[] = await this.sequelize.query(tidingSelect, {
          replacements: { pyqTidingId: info.pyqTidingId },
          type: QueryTypes.SELECT,
          transaction: t,
        })
        if (tidingSelectRes[0] && tidingSelectRes[0].userId !== info.userId) {
          await this.sequelize.query(toTidingMessageInsert, {
            replacements: { userId: tidingSelectRes[0].userId, commentId: toTidingCommentInsertRes[0] },
            type: QueryTypes.INSERT,
            transaction: t,
          })
        }
        return { status: !!toTidingCommentInsert[1], id: toTidingCommentInsert[0] }
      })
      return result
    }
  }

  async getPyqMessagesList(id: GetPyqMessaegesListId) {
    const commentMessagesSelect = `
      SELECT pm.id, pc.pyqTidings_id pyqTidingsId, ui.user_id fromId, ui.nickname fromName, ui.avatar_url fromAvatarUrl, 
        pc.content, pt.content title, pm.type, pm.createAt createTime
      FROM pyqMessages pm 
      INNER JOIN pyqComments pc ON pc.id = pm.comment_id
      INNER JOIN pyqTidings pt on pt.id = pc.pyqTidings_id
      INNER JOIN userInfo ui ON ui.user_id = pc.user_id
      WHERE pm.user_id = :userId
    `
    const thumbsUpMessagesSelect = `
      SELECT pm.id, pttu.pyqTidings_id pyqTidingsId, ui.user_id fromId, ui.nickname fromName, ui.avatar_url fromAvatarUrl, 
        pt.content title, pm.type, pm.createAt createTime
      FROM pyqMessages pm
      INNER JOIN pyqTidingsThumbsUp pttu ON pttu.id = pm.thumbsUp_id
      INNER JOIN pyqTidings pt ON pt.id = pttu.pyqTidings_id
      INNER JOIN userInfo ui ON ui.user_id = pttu.user_id
      WHERE pm.user_id = :userId
    `
    const messageDelete = `DELETE FROM pyqMessages WHERE user_id = :userId`
    const result = await this.sequelize.transaction(async (t) => {
      const commentMessagesSelectRes = await this.sequelize.query(commentMessagesSelect, {
        replacements: { ...id },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      const thumbsUpMessagesSelectRes = await this.sequelize.query(thumbsUpMessagesSelect, {
        replacements: { ...id },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      await this.sequelize.query(messageDelete, {
        replacements: { ...id },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      commentMessagesSelectRes.push(...thumbsUpMessagesSelectRes)
      return commentMessagesSelectRes
    })
    return result
  }

  async getPyqMessagesCount(id: GetPyqMessaegesListId) {
    const messageCountSelect = `SELECT COUNT(*) messageCount FROM pyqMessages WHERE user_id = :userId`
    const result = await this.sequelize.query(messageCountSelect, {
      replacements: { ...id },
      type: QueryTypes.SELECT,
    })
    return result[0]
  }
}
