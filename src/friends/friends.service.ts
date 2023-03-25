import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import {
  FriendInfoIds,
  FriendListId,
  SearchFriendAndGroupsByKeyword,
  UpdateFriendRemarksInfo,
} from './interface/friends.interface'

@Injectable()
export class FriendsService {
  constructor(private sequelize: Sequelize) {}

  async getFriendList(userId: FriendListId) {
    const friendListSelect = `
      SELECT 
        fg.id,
        fg.name,
        IFNULL(ff.total, 0) total,
        IF(ff.total, IFNULL(JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', fui.id,
            'name', fui.nickname,
            'remarks', fui.remarks,
            'avatarUrl', fui.avatarUrl,
            'signature', fui.signature,
            'status', fui.status
          )
        ), NULL), JSON_ARRAY()) members
      FROM friendGroups fg
      LEFT JOIN (
        SELECT 
          ui.user_id id, 
          f.friendGroup_id,
          ui.nickname, 
          f.remarks,
          ui.avatar_url avatarUrl, 
          ui.signature, 
          ui.status
        FROM friends f
        INNER JOIN userInfo ui ON ui.user_id = f.friend_id
        WHERE f.user_id = :userId
      ) fui ON fg.id = fui.friendGroup_id
      LEFT JOIN (
        SELECT COUNT(0) total, f.friendGroup_id
        FROM friends f
        WHERE f.user_id = :userId
        GROUP BY f.friendGroup_id
      ) ff ON ff.friendGroup_id = fg.id
      WHERE fg.user_id = :userId
      GROUP BY fg.id
    `
    const result = await this.sequelize.query(friendListSelect, {
      replacements: {
        ...userId,
      },
      type: QueryTypes.SELECT,
    })
    return result
  }

  async getFriendInfo(ids: FriendInfoIds) {
    const friendInfoSelect = `
      SELECT 
        f.friend_id id, 
        ui.nickname, 
        f.remarks, 
        ui.avatar_url avatarUrl, 
        ui.sex, 
        ui.signature, 
        ui.birthday, 
        u.email, 
        u.username,
        f.disturb
      FROM friends f
      INNER JOIN userInfo ui ON ui.user_id = f.friend_id
      INNER JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = :userId AND f.friend_id = :friendId
    `
    const result = await this.sequelize.query(friendInfoSelect, {
      replacements: {
        ...ids,
      },
      type: QueryTypes.SELECT,
    })
    return result.length === 0 ? null : result[0]
  }

  async updateFriendRemarks(info: UpdateFriendRemarksInfo) {
    const friendRemarksUpdate = `UPDATE friends SET remarks = :remarks WHERE user_id = :userId AND friend_id = :friendId`
    const result = await this.sequelize.query(friendRemarksUpdate, {
      replacements: {
        ...info,
      },
      type: QueryTypes.UPDATE,
    })
    return !!result[1]
  }

  async searchFriendsAndGroups(info: SearchFriendAndGroupsByKeyword) {
    const contactSelect = `
      SELECT u.id userId, u.username, ui.nickname name, ui.signature, ui.avatar_url avatarUrl, IFNULL(ff.isAdd, 0) isAdd
      FROM users u
      INNER JOIN userInfo ui ON ui.user_id = u.id
      LEFT JOIN (
        SELECT f.user_id, JSON_CONTAINS(JSON_ARRAYAGG(f.friend_id), JSON_ARRAY(:userId + 0)) isAdd
        FROM friends f
        GROUP BY f.user_id
      ) ff ON ff.user_id = u.id
      WHERE u.id != :userId AND (u.username = :keyword OR ui.nickname LIKE CONCAT('%', :keyword, '%'))
    `
    const groupSelect = `
      SELECT cg.id groupId, cg.number, cg.name, cg.avatar_url avatarUrl, ugg.isAdd
      FROM chatGroups cg
      INNER JOIN (
        SELECT ug.group_id, JSON_CONTAINS(JSON_ARRAYAGG(ug.user_id), JSON_ARRAY(:userId + 0)) isAdd
        FROM user_group ug
        GROUP BY ug.group_id
      ) ugg ON ugg.group_id = cg.id
      WHERE cg.number = :keyword OR cg.name LIKE CONCAT('%', :keyword, '%')
    `
    const result = await this.sequelize.transaction(async (t) => {
      const contactSelectRes = await this.sequelize.query(contactSelect, {
        replacements: { ...info },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      const groupSelectRes = await this.sequelize.query(groupSelect, {
        replacements: { ...info },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      contactSelectRes.push(...groupSelectRes)
      contactSelectRes.forEach((item: any, index: number) => {
        item['id'] = index + 1
        if (item.groupId) {
          item['isGroup'] = 1
        } else {
          item['isGroup'] = 0
        }
      })
      return contactSelectRes
    })
    return result
  }
}
