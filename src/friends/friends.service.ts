import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { FriendInfoIds, FriendListId } from './interface/friends.interface'

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
}
