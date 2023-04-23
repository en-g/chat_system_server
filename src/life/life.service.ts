import { Injectable } from '@nestjs/common'
import { Sequelize } from 'sequelize-typescript'
import {
  CollectLifeTidingsIds,
  CommentLifeTidingsInfo,
  DeleteLifeTidingsId,
  GetCollectionListId,
  GetMessageListId,
  GetNewLifeTidingsListId,
  GetRegardListId,
  GetUserCenterInfo,
  GetUserLifeTidingsListId,
  GetUserLifeTidingsListInfo,
  LifeTidingDetailId,
  LifeTidingsInfo,
  ReplyLifeTidingsInfo,
  ThumbsUpCommentIds,
  ThumbsUpLifeTidingsIds,
} from './interface/life.interface'
import { QueryTypes } from 'sequelize'

@Injectable()
export class LifeService {
  constructor(private readonly sequelize: Sequelize) {}

  async getNewLifeTidingsList(info: GetNewLifeTidingsListId) {
    const newTidingsListSelect = `
      SELECT lt.id, lt.user_id userId, ui.nickname name, ui.avatar_url avatarUrl, lt.title, lt.content, 
        lt.createAt createTime, ltif.pictures, 
        IFNULL(lttuu.isThumbsUp, 0) isThumbsUp, 
        IFNULL(lcc.isCollect, 0) isCollect, 
        IFNULL(ltuuu.thumbsUpCount, 0) thumbsUpCount,
        IFNULL((IFNULL(lcttt.commentCount1, 0) + IFNULL(lctuu.commentCount2, 0)), 0) commentsCount, 
        IFNULL(lccc.collectionsCount, 0) collectionsCount, lt.readings
      FROM lifeTidings lt
      INNER JOIN userInfo ui ON ui.user_id = lt.user_id
      LEFT JOIN (
        SELECT lti.lifeTidings_id, JSON_ARRAYAGG(
          JSON_OBJECT('id', lti.id, 'url', f.url)
        ) pictures
        FROM lifeTidingsImages lti
        INNER JOIN files f ON f.id = lti.file_id
        GROUP BY lti.lifeTidings_id
      ) ltif ON ltif.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lttu.lifeTidings_id, JSON_CONTAINS(JSON_ARRAYAGG(lttu.user_id), JSON_ARRAY(:userId + 0)) isThumbsUp
        FROM lifeTidingsThumbsUp lttu
        GROUP BY lttu.lifeTidings_id
      ) lttuu ON lttuu.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lc.lifeTidings_id, JSON_CONTAINS(JSON_ARRAYAGG(lc.user_id), JSON_ARRAY(:userId + 0)) isCollect
        FROM lifeCollections lc
        GROUP BY lc.lifeTidings_id
      ) lcc ON lcc.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lttu.lifeTidings_id, COUNT(*) thumbsUpCount
        FROM lifeTidingsThumbsUp lttu
        GROUP BY lttu.lifeTidings_id
      ) ltuuu ON ltuuu.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lctt.lifeTidings_id, COUNT(*) commentCount1
        FROM lifeCommentToTidings lctt
        GROUP BY lctt.lifeTidings_id
      ) lcttt ON lcttt.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lctu.lifeTidings_id, COUNT(*) commentCount2
        FROM lifeCommentToUser lctu
        GROUP BY lctu.lifeTidings_id
      ) lctuu ON lctuu.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lc.lifeTidings_id, COUNT(*) collectionsCount
        FROM lifeCollections lc
        GROUP BY lc.lifeTidings_id
      ) lccc ON lccc.lifeTidings_id = lt.id
      ORDER BY lt.createAt DESC
    `
    const hotReviewSelect = `
      SELECT lctt.id, lctt.content, IFNULL(JSON_LENGTH(lctuu.ids), 0) thumbsUpCount,
        IFNULL(JSON_CONTAINS(lctuu.ids, JSON_ARRAY(:userId + 0)), 0) isThumbsUp
      FROM lifeCommentToTidings lctt
      LEFT JOIN (
        SELECT lctu.lifeComment_id, JSON_ARRAYAGG(lctu.user_id) ids
        FROM lifeCommentThumbsUp lctu
        GROUP BY lctu.lifeComment_id
      ) lctuu ON lctuu.lifeComment_id = lctt.id
      WHERE lctt.lifeTidings_id = :lifeTidingsId
      ORDER BY JSON_LENGTH(lctuu.ids) DESC
      LIMIT 1
    `
    const result = await this.sequelize.transaction(async (t) => {
      const newTidingsListSelectRes: any[] = await this.sequelize.query(newTidingsListSelect, {
        replacements: { ...info },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      for (const item of newTidingsListSelectRes) {
        const hotReviewSelectRes = await this.sequelize.query(hotReviewSelect, {
          replacements: {
            userId: info.userId,
            lifeTidingsId: item.id,
          },
          type: QueryTypes.SELECT,
          transaction: t,
        })
        item['hotReview'] = hotReviewSelectRes[0]
      }
      return newTidingsListSelectRes
    })
    return {
      total: result.length,
      list: result.slice(
        (parseInt(info.pageNum) - 1) * parseInt(info.pageSize),
        (parseInt(info.pageNum) - 1) * parseInt(info.pageSize) + parseInt(info.pageSize),
      ),
    }
  }

  async getHotLifeTidingsList(info: GetNewLifeTidingsListId) {
    const newTidingsListSelect = `
      SELECT lt.id, lt.user_id userId, ui.nickname name, ui.avatar_url avatarUrl, lt.title, lt.content, 
        lt.createAt createTime, ltif.pictures, 
        IFNULL(lttuu.isThumbsUp, 0) isThumbsUp, 
        IFNULL(lcc.isCollect, 0) isCollect, 
        IFNULL(ltuuu.thumbsUpCount, 0) thumbsUpCount,
        IFNULL((IFNULL(lcttt.commentCount1, 0) + IFNULL(lctuu.commentCount2, 0)), 0) commentsCount, 
        IFNULL(lccc.collectionsCount, 0) collectionsCount, lt.readings
      FROM lifeTidings lt
      INNER JOIN userInfo ui ON ui.user_id = lt.user_id
      LEFT JOIN (
        SELECT lti.lifeTidings_id, JSON_ARRAYAGG(
          JSON_OBJECT('id', lti.id, 'url', f.url)
        ) pictures
        FROM lifeTidingsImages lti
        INNER JOIN files f ON f.id = lti.file_id
        GROUP BY lti.lifeTidings_id
      ) ltif ON ltif.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lttu.lifeTidings_id, JSON_CONTAINS(JSON_ARRAYAGG(lttu.user_id), JSON_ARRAY(:userId + 0)) isThumbsUp
        FROM lifeTidingsThumbsUp lttu
        GROUP BY lttu.lifeTidings_id
      ) lttuu ON lttuu.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lc.lifeTidings_id, JSON_CONTAINS(JSON_ARRAYAGG(lc.user_id), JSON_ARRAY(:userId + 0)) isCollect
        FROM lifeCollections lc
        GROUP BY lc.lifeTidings_id
      ) lcc ON lcc.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lttu.lifeTidings_id, COUNT(*) thumbsUpCount
        FROM lifeTidingsThumbsUp lttu
        GROUP BY lttu.lifeTidings_id
      ) ltuuu ON ltuuu.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lctt.lifeTidings_id, COUNT(*) commentCount1
        FROM lifeCommentToTidings lctt
        GROUP BY lctt.lifeTidings_id
      ) lcttt ON lcttt.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lctu.lifeTidings_id, COUNT(*) commentCount2
        FROM lifeCommentToUser lctu
        GROUP BY lctu.lifeTidings_id
      ) lctuu ON lctuu.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lc.lifeTidings_id, COUNT(*) collectionsCount
        FROM lifeCollections lc
        GROUP BY lc.lifeTidings_id
      ) lccc ON lccc.lifeTidings_id = lt.id
      ORDER BY lt.readings DESC,
              (lcttt.commentCount1 + lctuu.commentCount2) DESC, 
              ltuuu.thumbsUpCount DESC, 
              lccc.collectionsCount DESC
    `
    const hotReviewSelect = `
      SELECT lctt.id, lctt.content, IFNULL(JSON_LENGTH(lctuu.ids), 0) thumbsUpCount,
        IFNULL(JSON_CONTAINS(lctuu.ids, JSON_ARRAY(:userId + 0)), 0) isThumbsUp
      FROM lifeCommentToTidings lctt
      LEFT JOIN (
        SELECT lctu.lifeComment_id, JSON_ARRAYAGG(lctu.user_id) ids
        FROM lifeCommentThumbsUp lctu
        GROUP BY lctu.lifeComment_id
      ) lctuu ON lctuu.lifeComment_id = lctt.id
      WHERE lctt.lifeTidings_id = :lifeTidingsId
      ORDER BY JSON_LENGTH(lctuu.ids) DESC
      LIMIT 1
    `
    const result = await this.sequelize.transaction(async (t) => {
      const newTidingsListSelectRes: any[] = await this.sequelize.query(newTidingsListSelect, {
        replacements: { ...info },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      for (const item of newTidingsListSelectRes) {
        const hotReviewSelectRes = await this.sequelize.query(hotReviewSelect, {
          replacements: {
            userId: info.userId,
            lifeTidingsId: item.id,
          },
          type: QueryTypes.SELECT,
          transaction: t,
        })
        item['hotReview'] = hotReviewSelectRes[0]
      }
      return newTidingsListSelectRes
    })
    return {
      total: result.length,
      list: result.slice(
        (parseInt(info.pageNum) - 1) * parseInt(info.pageSize),
        (parseInt(info.pageNum) - 1) * parseInt(info.pageSize) + parseInt(info.pageSize),
      ),
    }
  }

  async getUserLifeTidingsList(id: GetUserLifeTidingsListId, info: GetUserLifeTidingsListInfo) {
    const tidingsList = `
      SELECT lt.id, lt.user_id userId, ui.nickname name, ui.avatar_url avatarUrl, lt.title, lt.content, 
        lt.createAt createTime, ltif.pictures, 
        IFNULL(lttuu.isThumbsUp, 0) isThumbsUp, 
        IFNULL(lcc.isCollect, 0) isCollect, 
        IFNULL(ltuuu.thumbsUpCount, 0) thumbsUpCount,
        IFNULL((IFNULL(lcttt.commentCount1, 0) + IFNULL(lctuu.commentCount2, 0)), 0) commentsCount, 
        IFNULL(lccc.collectionsCount, 0) collectionsCount, lt.readings
      FROM lifeTidings lt
      INNER JOIN userInfo ui ON ui.user_id = lt.user_id
      LEFT JOIN (
        SELECT lti.lifeTidings_id, JSON_ARRAYAGG(
          JSON_OBJECT('id', lti.id, 'url', f.url)
        ) pictures
        FROM lifeTidingsImages lti
        INNER JOIN files f ON f.id = lti.file_id
        GROUP BY lti.lifeTidings_id
      ) ltif ON ltif.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lttu.lifeTidings_id, JSON_CONTAINS(JSON_ARRAYAGG(lttu.user_id), JSON_ARRAY(:selfId + 0)) isThumbsUp
        FROM lifeTidingsThumbsUp lttu
        GROUP BY lttu.lifeTidings_id
      ) lttuu ON lttuu.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lc.lifeTidings_id, JSON_CONTAINS(JSON_ARRAYAGG(lc.user_id), JSON_ARRAY(:selfId + 0)) isCollect
        FROM lifeCollections lc
        GROUP BY lc.lifeTidings_id
      ) lcc ON lcc.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lttu.lifeTidings_id, COUNT(*) thumbsUpCount
        FROM lifeTidingsThumbsUp lttu
        GROUP BY lttu.lifeTidings_id
      ) ltuuu ON ltuuu.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lctt.lifeTidings_id, COUNT(*) commentCount1
        FROM lifeCommentToTidings lctt
        GROUP BY lctt.lifeTidings_id
      ) lcttt ON lcttt.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lctu.lifeTidings_id, COUNT(*) commentCount2
        FROM lifeCommentToUser lctu
        GROUP BY lctu.lifeTidings_id
      ) lctuu ON lctuu.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lc.lifeTidings_id, COUNT(*) collectionsCount
        FROM lifeCollections lc
        GROUP BY lc.lifeTidings_id
      ) lccc ON lccc.lifeTidings_id = lt.id
      WHERE lt.user_id = :userId
      ORDER BY lt.createAt DESC
    `
    const hotReviewSelect = `
      SELECT lctt.id, lctt.content, IFNULL(JSON_LENGTH(lctuu.ids), 0) thumbsUpCount,
        IFNULL(JSON_CONTAINS(lctuu.ids, JSON_ARRAY(:selfId + 0)), 0) isThumbsUp
      FROM lifeCommentToTidings lctt
      LEFT JOIN (
        SELECT lctu.lifeComment_id, JSON_ARRAYAGG(lctu.user_id) ids
        FROM lifeCommentThumbsUp lctu
        GROUP BY lctu.lifeComment_id
      ) lctuu ON lctuu.lifeComment_id = lctt.id
      WHERE lctt.lifeTidings_id = :lifeTidingsId
      ORDER BY JSON_LENGTH(lctuu.ids) DESC
      LIMIT 1
    `
    const result = await this.sequelize.transaction(async (t) => {
      const tidingsListRes: any[] = await this.sequelize.query(tidingsList, {
        replacements: { userId: id.userId, selfId: info.selfId },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      for (const item of tidingsListRes) {
        const hotReviewSelectRes = await this.sequelize.query(hotReviewSelect, {
          replacements: {
            selfId: info.selfId,
            lifeTidingsId: item.id,
          },
          type: QueryTypes.SELECT,
          transaction: t,
        })
        item['hotReview'] = hotReviewSelectRes[0]
      }
      return tidingsListRes
    })
    return {
      total: result.length,
      list: result.slice(
        (parseInt(info.pageNum) - 1) * parseInt(info.pageSize),
        (parseInt(info.pageNum) - 1) * parseInt(info.pageSize) + parseInt(info.pageSize),
      ),
    }
  }

  async getUserCenterInfo(ids: GetUserCenterInfo) {
    const userCenterInfoSelect = `
      SELECT ui.user_id userId, ui.nickname name, ui.avatar_url avatarUrl, 
        IFNULL((ltt.thumbsUpCount1 + lcttt.thumbsUpCount2), 0) likes, 
        IFNULL(JSON_LENGTH(lrr.ids), 0) fans, 
        IFNULL((IFNULL(lttt.commentCount1, 0) + IFNULL(lctttt.commentCount2, 0)), 0) comments,
        IFNULL(JSON_CONTAINS(lrr.ids, JSON_ARRAY(:selfId + 0)), 0) isRegard,
        IFNULL(JSON_CONTAINS(ff.ids, JSON_ARRAY(:selfId + 0)), 0) isAdd
      FROM userInfo ui
      LEFT JOIN (
        SELECT f.user_id, JSON_ARRAYAGG(f.friend_id) ids
        FROM friends f 
        GROUP BY f.user_id
      ) ff ON ff.user_id = ui.user_id
      LEFT JOIN (
        SELECT lt.user_id, SUM(lttuu.thumbsUpCount1) thumbsUpCount1
        FROM lifeTidings lt
        LEFT JOIN (
          SELECT lttu.lifeTidings_id, COUNT(*) thumbsUpCount1
          FROM lifeTidingsThumbsUp lttu
          GROUP BY lttu.lifeTidings_id
        ) lttuu ON lttuu.lifeTidings_id = lt.id
        GROUP BY lt.user_id
      ) ltt ON ltt.user_id = ui.user_id
      LEFT JOIN (
        SELECT lctt.user_id, SUM(lctuu.thumbsUpCount2) thumbsUpCount2
        FROM lifeCommentToTidings lctt
        LEFT JOIN (
          SELECT lctu.lifeComment_id, COUNT(*) thumbsUpCount2
          FROM lifeCommentThumbsUp lctu
          GROUP BY lctu.lifeComment_id
        ) lctuu ON lctuu.lifeComment_id = lctt.id
        GROUP BY lctt.user_id
      ) lcttt ON lcttt.user_id = ui.user_id
      LEFT JOIN (
        SELECT lr.regard_id, JSON_ARRAYAGG(lr.user_id) ids
        FROM lifeRegards lr
        GROUP BY lr.regard_id
      ) lrr ON lrr.regard_id = ui.user_id
      LEFT JOIN (
        SELECT lt.user_id, SUM(lctt.commentCount1) commentCount1
        FROM lifeTidings lt
        LEFT JOIN (
          SELECT lctt.lifeTidings_id, COUNT(*) commentCount1
          FROM lifeCommentToTidings lctt
          GROUP BY lctt.lifeTidings_id
        ) lctt ON lctt.lifeTidings_id = lt.id
        GROUP BY lt.user_id
      ) lttt ON lttt.user_id = ui.user_id
      LEFT JOIN (
        SELECT lctt.user_id, SUM(lctuu.commentCount2) commentCount2
        FROM lifeCommentToTidings lctt
        LEFT JOIN (
          SELECT lctu.lifeComment_id, COUNT(*) commentCount2
          FROM lifeCommentToUser lctu
          GROUP BY lctu.lifeComment_id
        ) lctuu ON lctuu.lifeComment_id = lctt.id
        GROUP BY lctt.user_id
      ) lctttt ON lctttt.user_id = ui.user_id
      WHERE ui.user_id = :userId
    `
    const result = await this.sequelize.query(userCenterInfoSelect, {
      replacements: { ...ids },
      type: QueryTypes.SELECT,
    })
    return result[0]
  }

  async getRegardsList(id: GetRegardListId) {
    const regardsListSelect = `
      SELECT lr.id, lr.regard_id userId, ui.nickname name, ui.signature signature, ui.avatar_url avatarUrl
      FROM lifeRegards lr
      INNER JOIN userInfo ui ON ui.user_id = lr.regard_id
      WHERE lr.user_id = :userId
    `
    const result: any = await this.sequelize.query(regardsListSelect, {
      replacements: { ...id },
      type: QueryTypes.SELECT,
    })
    return result
  }

  async getMessagesList(id: GetMessageListId) {
    const messageListSelect1 = `
    SELECT lm.id, lctt.lifeTidings_id lifeTidingId, lt.title, lm.user_id fromId, 
      ui.nickname fromName, ui.avatar_url fromAvatarUrl, lctt.content,
      lm.type, lm.createAt createTime
    FROM lifeMessages lm
    INNER JOIN lifeCommentToTidings lctt ON lctt.id = lm.toTiding_id
    INNER JOIN userInfo ui ON ui.user_id = lctt.user_id
    INNER JOIN lifeTidings lt ON lt.id = lctt.lifeTidings_id
    WHERE lm.user_id = :userId
    `
    const messageListSelect2 = `
      SELECT lm.id, lctu.lifeTidings_id lifeTidingId, lt.title, lm.user_id fromId, 
        ui.nickname fromName, ui.avatar_url fromAvatarUrl, lctu.content,
        lm.type, lm.createAt createTime
      FROM lifeMessages lm
      INNER JOIN lifeCommentToUser lctu ON lctu.id = lm.toUser_id
      INNER JOIN userInfo ui ON ui.user_id = lctu.from_id
      INNER JOIN lifeTidings lt ON lt.id = lctu.lifeTidings_id
      WHERE lm.user_id = :userId
    `
    const result = await this.sequelize.transaction(async (t) => {
      const messageListSelect1Res = await this.sequelize.query(messageListSelect1, {
        replacements: { ...id },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      const messageListSelect2Res = await this.sequelize.query(messageListSelect2, {
        replacements: { ...id },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      messageListSelect1Res.push(...messageListSelect2Res)
      return messageListSelect1Res
    })
    return result
  }

  async getCollectionsList(id: GetCollectionListId) {
    const collectionsListSelect = `
      SELECT lc.id, lc.lifeTidings_id lifeTidingsId, lt.title, ui.nickname name, ui.avatar_url avatarUrl
      FROM lifeCollections lc
      INNER JOIN lifeTidings lt ON lt.id = lc.lifeTidings_id
      INNER JOIN userInfo ui ON ui.user_id = lt.user_id
      WHERE lc.user_id = :userId
    `
    const result: any = await this.sequelize.query(collectionsListSelect, {
      replacements: { ...id },
      type: QueryTypes.SELECT,
    })
    return result
  }

  async releaseLifeTidings(info: LifeTidingsInfo) {
    const tidingInsert = `INSERT INTO lifeTidings (user_id, title, content) VALUES (:userId, :title, :content)`
    const imageInssert = `INSERT INTO lifeTidingsImages (lifeTidings_id, file_id) VALUES (?, ?)`
    const result = await this.sequelize.transaction(async (t) => {
      const tidingInsertRes = await this.sequelize.query(tidingInsert, {
        replacements: { ...info },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      if (!tidingInsertRes[1]) return false
      let res = true
      for (let i = 0; i < info.pictureIds.length; i++) {
        const imageInssertRes = await this.sequelize.query(imageInssert, {
          replacements: [tidingInsertRes[0], info.pictureIds[i]],
          type: QueryTypes.INSERT,
          transaction: t,
        })
        res = res && !!imageInssertRes[1]
      }
      return res
    })
    return result
  }

  async thumbsLifeTidings(ids: ThumbsUpLifeTidingsIds) {
    const thumbsTidingInsert = `INSERT INTO lifeTidingsThumbsUp (lifeTidings_id, user_id) VALUES (:lifeTidingId, :userId)`
    const result = await this.sequelize.query(thumbsTidingInsert, {
      replacements: { ...ids },
      type: QueryTypes.INSERT,
    })
    return !!result[1]
  }

  async deleteThumbsLifeTidings(ids: ThumbsUpLifeTidingsIds) {
    const thumbsTidingDelete = `DELETE FROM lifeTidingsThumbsUp WHERE lifeTidings_id = :lifeTidingId AND user_id = :userId`
    await this.sequelize.query(thumbsTidingDelete, {
      replacements: { ...ids },
      type: QueryTypes.DELETE,
    })
    return true
  }

  async collectLifeTidings(ids: CollectLifeTidingsIds) {
    const collectTidingsInsert = `INSERT INTO lifeCollections (lifeTidings_id, user_id) VALUES (:lifeTidingId, :userId)`
    const result = await this.sequelize.query(collectTidingsInsert, {
      replacements: { ...ids },
      type: QueryTypes.INSERT,
    })
    return !!result[1]
  }

  async deleteCollectLifeTidings(ids: CollectLifeTidingsIds) {
    const collectTidingsDelete = `DELETE FROM lifeCollections WHERE lifeTidings_id = :lifeTidingId AND user_id = :userId`
    await this.sequelize.query(collectTidingsDelete, {
      replacements: { ...ids },
      type: QueryTypes.DELETE,
    })
    return true
  }

  async deleteLifeTidings(id: DeleteLifeTidingsId) {
    const delete1 = `DELETE FROM lifeTidings WHERE id = :lifeTidingId`
    const delete2 = `DELETE FROM lifeTidingsImages WHERE lifeTidings_id = :lifeTidingId`
    const delete3 = `DELETE FROM lifeTidingsThumbsUp WHERE lifeTidings_id = :lifeTidingId`
    const delete4 = `DELETE FROM lifeCollections WHERE lifeTidings_id = :lifeTidingId`
    const delete5 = `DELETE FROM lifeCommentToTidings WHERE lifeTidings_id = :lifeTidingId`
    const delete6 = `DELETE FROM lifeCommentToUser WHERE lifeTidings_id = :lifeTidingId`
    const delete7 = `DELETE FROM lifeCommentThumbsUp WHERE lifeTidings_id = :lifeTidingId`
    const result = await this.sequelize.transaction(async (t) => {
      await this.sequelize.query(delete1, {
        replacements: { ...id },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      await this.sequelize.query(delete2, {
        replacements: { ...id },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      await this.sequelize.query(delete3, {
        replacements: { ...id },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      await this.sequelize.query(delete4, {
        replacements: { ...id },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      await this.sequelize.query(delete5, {
        replacements: { ...id },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      await this.sequelize.query(delete6, {
        replacements: { ...id },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      await this.sequelize.query(delete7, {
        replacements: { ...id },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      return true
    })
    return result
  }

  async getLifeTidingDetail(ids: LifeTidingDetailId) {
    const readingInsert = `UPDATE lifeTidings SET readings = readings + 1 WHERE id = :lifeTidingId`
    const lifeTidingDetailSelect = `
      SELECT lt.id, lt.user_id userId, ui.nickname name, ui.avatar_url avatarUrl, lt.title, lt.content, 
        lt.createAt createTime, ltif.pictures, 
        IFNULL(lttuu.isThumbsUp, 0) isThumbsUp, 
        IFNULL(lcc.isCollect, 0) isCollect, 
        IFNULL(ltuuu.thumbsUpCount, 0) thumbsUpCount,
        IFNULL((IFNULL(lcttt.commentCount1, 0) + IFNULL(lctuu.commentCount2, 0)), 0) commentsCount,  
        IFNULL(lccc.collectionsCount, 0) collectionsCount, lt.readings
      FROM lifeTidings lt
      INNER JOIN userInfo ui ON ui.user_id = lt.user_id
      LEFT JOIN (
        SELECT lti.lifeTidings_id, JSON_ARRAYAGG(
          JSON_OBJECT('id', lti.id, 'url', f.url)
        ) pictures
        FROM lifeTidingsImages lti
        INNER JOIN files f ON f.id = lti.file_id
        GROUP BY lti.lifeTidings_id
      ) ltif ON ltif.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lttu.lifeTidings_id, JSON_CONTAINS(JSON_ARRAYAGG(lttu.user_id), JSON_ARRAY(:userId + 0)) isThumbsUp
        FROM lifeTidingsThumbsUp lttu
        GROUP BY lttu.lifeTidings_id
      ) lttuu ON lttuu.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lc.lifeTidings_id, JSON_CONTAINS(JSON_ARRAYAGG(lc.user_id), JSON_ARRAY(:userId + 0)) isCollect
        FROM lifeCollections lc
        GROUP BY lc.lifeTidings_id
      ) lcc ON lcc.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lttu.lifeTidings_id, COUNT(*) thumbsUpCount
        FROM lifeTidingsThumbsUp lttu
        GROUP BY lttu.lifeTidings_id
      ) ltuuu ON ltuuu.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lctt.lifeTidings_id, COUNT(*) commentCount1
        FROM lifeCommentToTidings lctt
        GROUP BY lctt.lifeTidings_id
      ) lcttt ON lcttt.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lctu.lifeTidings_id, COUNT(*) commentCount2
        FROM lifeCommentToUser lctu
        GROUP BY lctu.lifeTidings_id
      ) lctuu ON lctuu.lifeTidings_id = lt.id
      LEFT JOIN (
        SELECT lc.lifeTidings_id, COUNT(*) collectionsCount
        FROM lifeCollections lc
        GROUP BY lc.lifeTidings_id
      ) lccc ON lccc.lifeTidings_id = lt.id
      WHERE lt.id = :lifeTidingId
    `
    const lifeTidingCommentSelect = `
      SELECT lctt.id, lctt.user_id userId, ui.nickname name, ui.avatar_url avatarUrl,
        lctt.content, lctt.createAt createTime,
        IFNULL(lctuu.thumbsUpCount, 0) thumbsUpCount,
        IFNULL(lctuuu.isThumbsUp, 0) isThumbsUp
      FROM lifeCommentToTidings lctt
      INNER JOIN userInfo ui ON ui.user_id = lctt.user_id
      LEFT JOIN (
        SELECT lctu.lifeComment_id, COUNT(*) thumbsUpCount
        FROM lifeCommentThumbsUp lctu
        WHERE lctu.lifeTidings_id = :lifeTidingId
        GROUP BY lctu.lifeComment_id
      ) lctuu ON lctuu.lifeComment_id = lctt.id
      LEFT JOIN (
        SELECT lctu.lifeComment_id, JSON_CONTAINS(JSON_ARRAYAGG(lctu.user_id), JSON_ARRAY(:userId + 0)) isThumbsUp
        FROM lifeCommentThumbsUp lctu
        WHERE lctu.lifeTidings_id = :lifeTidingId
        GROUP BY lctu.lifeComment_id
      ) lctuuu ON lctuuu.lifeComment_id = lctt.id
      WHERE lctt.lifeTidings_id = :lifeTidingId
      ORDER BY lctt.createAt DESC
    `
    const lifeTidingCommentChildrenSelect = `
      SELECT lctu.id, lctu.lifeComment_id commentId, lctu.from_id fromId, lctu.to_id toId, 
        ui.nickname fromName, ui.avatar_url fromAvatarUrl, uii.nickname toName, uii.avatar_url toAvatarUrl,
        lctu.content, lctu.createAt createTime
      FROM lifeCommentToUser lctu
      INNER JOIN userInfo ui ON ui.user_id = lctu.from_id
      INNER JOIN userInfo uii ON uii.user_id = lctu.to_id
      WHERE lctu.lifeComment_id = :commentId AND lctu.lifeTidings_id = :lifeTidingId
      ORDER BY lctu.createAt
    `
    const result = await this.sequelize.transaction(async (t) => {
      await this.sequelize.query(readingInsert, {
        replacements: { ...ids },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      const lifeTidingDetailSelectRes = await this.sequelize.query(lifeTidingDetailSelect, {
        replacements: { ...ids },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      const lifeTidingCommentSelectRes: any[] = await this.sequelize.query(lifeTidingCommentSelect, {
        replacements: { ...ids },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      for (const comment of lifeTidingCommentSelectRes) {
        const lifeTidingCommentChildrenSelectRes = await this.sequelize.query(lifeTidingCommentChildrenSelect, {
          replacements: { commentId: comment.id, lifeTidingId: ids.lifeTidingId },
          type: QueryTypes.SELECT,
          transaction: t,
        })
        comment['children'] = lifeTidingCommentChildrenSelectRes
      }
      lifeTidingDetailSelectRes[0]['commentsList'] = lifeTidingCommentSelectRes
      return lifeTidingDetailSelectRes[0]
    })
    return result
  }

  async commentLifeTidings(info: CommentLifeTidingsInfo) {
    const commentInsert = `INSERT INTO lifeCommentToTidings (lifeTidings_id, user_id, content) VALUES (:lifeTidingId, :userId, :content)`
    const tidingSelect = `SELECT user_id userId FROM lifeTidings WHERE id = :lifeTidingId`
    const messageInsert = `INSERT INTO lifeMessages (user_id, toTiding_id, type) VALUES (:userId, :commentId, 1)`
    const commentSelect = `
      SELECT lctt.id, lctt.user_id userId, ui.nickname name, ui.avatar_url avatarUrl,
        lctt.content, lctt.createAt createTime,
        IFNULL(lctuu.thumbsUpCount, 0) thumbsUpCount,
        IFNULL(lctuuu.isThumbsUp, 0) isThumbsUp
      FROM lifeCommentToTidings lctt
      INNER JOIN userInfo ui ON ui.user_id = lctt.user_id
      LEFT JOIN (
        SELECT lctu.lifeComment_id, COUNT(*) thumbsUpCount
        FROM lifeCommentThumbsUp lctu
        WHERE lctu.lifeTidings_id = :lifeTidingId
        GROUP BY lctu.lifeComment_id
      ) lctuu ON lctuu.lifeComment_id = lctt.id
      LEFT JOIN (
        SELECT lctu.lifeComment_id, JSON_CONTAINS(JSON_ARRAYAGG(lctu.user_id), JSON_ARRAY(:userId + 0)) isThumbsUp
        FROM lifeCommentThumbsUp lctu
        WHERE lctu.lifeTidings_id = :lifeTidingId
        GROUP BY lctu.lifeComment_id
      ) lctuuu ON lctuuu.lifeComment_id = lctt.id
      WHERE lctt.lifeTidings_id = :lifeTidingId AND lctt.id = :commentId
    `
    const result = await this.sequelize.transaction(async (t) => {
      const commentInsertRes = await this.sequelize.query(commentInsert, {
        replacements: {
          lifeTidingId: info.lifeTidingId,
          userId: info.fromId,
          content: info.content,
        },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      if (!commentInsertRes[1]) return { status: !!commentInsertRes[1], comment: null }
      const tidingSelectRes: any[] = await this.sequelize.query(tidingSelect, {
        replacements: { lifeTidingId: info.lifeTidingId },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      let messageInsertRes = true
      if (tidingSelectRes[0] && tidingSelectRes[0].userId !== info.fromId) {
        const result = await this.sequelize.query(messageInsert, {
          replacements: { userId: info.toId, commentId: commentInsertRes[0] },
          type: QueryTypes.INSERT,
          transaction: t,
        })
        messageInsertRes = messageInsertRes && !!result[1]
        if (!messageInsertRes) return { status: messageInsertRes, comment: null }
      }
      const commentSelectRes = await this.sequelize.query(commentSelect, {
        replacements: { lifeTidingId: info.lifeTidingId, userId: info.fromId, commentId: commentInsertRes[0] },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      return {
        status: !!commentInsertRes[1] && messageInsertRes,
        comment: commentSelectRes[0],
      }
    })
    return result
  }

  async replyLifeTidings(info: ReplyLifeTidingsInfo) {
    const commentInsert = `
      INSERT INTO lifeCommentToUser (lifeTidings_id, lifeComment_id, from_id, to_id, content) VALUES (:lifeTidingId, :lifeCommentId, :fromId, :toId, :content)
    `
    const messageInsert = `INSERT INTO lifeMessages (user_id, toUser_id, type) VALUES (:userId, :replyId, 2)`
    const commentSelect = `
      SELECT lctu.id, lctu.lifeComment_id commentId, lctu.from_id fromId, lctu.to_id toId, 
        ui.nickname fromName, ui.avatar_url fromAvatarUrl, uii.nickname toName, 
        lctu.content, lctu.createAt createTime
      FROM lifeCommentToUser lctu
      INNER JOIN userInfo ui ON ui.user_id = lctu.from_id
      INNER JOIN userInfo uii ON uii.user_id = lctu.to_id
      WHERE lctu.lifeComment_id = :lifeCommentId AND lctu.lifeTidings_id = :lifeTidingId AND lctu.id = :replyId
    `
    const result = await this.sequelize.transaction(async (t) => {
      const commentInsertRes = await this.sequelize.query(commentInsert, {
        replacements: { ...info },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      if (!commentInsertRes[1]) return { status: !!commentInsertRes[1], comment: null }
      const messageInsertRes = await this.sequelize.query(messageInsert, {
        replacements: { userId: info.toId, replyId: commentInsertRes[0] },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      if (!messageInsertRes[1]) return { status: !!messageInsertRes[1], comment: null }
      const commentSelectRes = await this.sequelize.query(commentSelect, {
        replacements: {
          lifeTidingId: info.lifeTidingId,
          lifeCommentId: info.lifeCommentId,
          replyId: commentInsertRes[0],
        },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      return {
        status: !!commentInsertRes[1] && !!messageInsertRes[1],
        comment: commentSelectRes[0],
      }
    })
    return result
  }

  async thumbLifeComment(ids: ThumbsUpCommentIds) {
    const thumbsCommentInsert = `INSERT INTO lifeCommentThumbsUp (lifeTidings_id, lifeComment_id, user_id) VALUES (:lifeTidingId, :lifeCommentId, :userId)`
    const result = await this.sequelize.query(thumbsCommentInsert, {
      replacements: { ...ids },
      type: QueryTypes.INSERT,
    })
    return !!result[1]
  }

  async cancelthumbLifeComment(ids: ThumbsUpCommentIds) {
    const thumbsCommentDelete = `DELETE FROM lifeCommentThumbsUp WHERE lifeTidings_id = :lifeTidingId AND lifeComment_id = :lifeCommentId AND user_id = :userId`
    await this.sequelize.query(thumbsCommentDelete, {
      replacements: { ...ids },
      type: QueryTypes.DELETE,
    })
    return true
  }

  async getHotBaseLifeTidingsList() {
    const tidingsList = `
      SELECT id, title, readings 
      FROM lifeTidings
      ORDER BY readings DESC
      LIMIT 10
    `
    const result: any = await this.sequelize.query(tidingsList, {
      type: QueryTypes.SELECT,
    })
    return result
  }
}
