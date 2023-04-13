import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import {
  AgreeAddContactInfo,
  ContactListAboutGroup,
  DeleteContact,
  FriendInfoIds,
  FriendListId,
  GetAllContactInfo,
  RefuseAddContactInfo,
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
      f.disturb,
      f.friendGroup_id friendGroupId,
      fg.name friendGroupName
    FROM friends f
    INNER JOIN userInfo ui ON ui.user_id = f.friend_id
    INNER JOIN users u ON u.id = f.friend_id
    INNER JOIN friendGroups fg ON fg.id = f.friendGroup_id
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
      SELECT cg.id groupId, cg.leader_id leaderId, cg.number, cg.name, cg.avatar_url avatarUrl, ugg.isAdd
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

  async agreeAddContact(info: AgreeAddContactInfo) {
    const noticeSelect = `
      SELECT from_id fromId, to_id toId, friendGroup_id friendGroupId, remarks
      FROM friendNotices
      WHERE id = :noticeId
    `
    const noticeUpdate = `UPDATE friendNotices SET status = 1 WHERE id = :noticeId`
    const friendInsert = `INSERT INTO friends (user_id, friend_id, friendGroup_id, remarks) VALUES (:fromId, :toId, :friendGroupId, :remarks) `
    const chatMessageInsert = `INSERT INTO friendChatMessages (from_id, to_id, type, message) VALUES (:fromId, :toId, 1, '我们已经是好友了，快来聊天吧！')`
    const result = await this.sequelize.transaction(async (t) => {
      const noticeSelectRes: any[] = await this.sequelize.query(noticeSelect, {
        replacements: { noticeId: info.noticeId },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      if (noticeSelectRes.length === 0) return false
      const noticeUpdateRes = await this.sequelize.query(noticeUpdate, {
        replacements: { noticeId: info.noticeId },
        type: QueryTypes.UPDATE,
        transaction: t,
      })
      const fromFriendInsertRes = await this.sequelize.query(friendInsert, {
        replacements: {
          fromId: noticeSelectRes[0].fromId,
          toId: noticeSelectRes[0].toId,
          friendGroupId: noticeSelectRes[0].friendGroupId,
          remarks: noticeSelectRes[0].remarks,
        },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      const toFriendInsertRes = await this.sequelize.query(friendInsert, {
        replacements: {
          fromId: noticeSelectRes[0].toId,
          toId: noticeSelectRes[0].fromId,
          friendGroupId: info.friendGroupId,
          remarks: info.remarks,
        },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      const fromChatMessageInsert = await this.sequelize.query(chatMessageInsert, {
        replacements: {
          fromId: noticeSelectRes[0].fromId,
          toId: noticeSelectRes[0].toId,
        },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      const toChatMessageInsert = await this.sequelize.query(chatMessageInsert, {
        replacements: {
          fromId: noticeSelectRes[0].toId,
          toId: noticeSelectRes[0].fromId,
        },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      return (
        !!noticeUpdateRes[1] &&
        !!fromFriendInsertRes[1] &&
        !!toFriendInsertRes[1] &&
        !!fromChatMessageInsert[1] &&
        !!toChatMessageInsert[1]
      )
    })
    return result
  }

  async refuseAddContact(id: RefuseAddContactInfo) {
    const noticeUpdate = `UPDATE friendNotices SET status = 2 WHERE id = :noticeId`
    const result = await this.sequelize.query(noticeUpdate, {
      replacements: { ...id },
      type: QueryTypes.UPDATE,
    })
    return !!result[1]
  }

  async getAllContactInfo(id: GetAllContactInfo) {
    const contactListSelect = `
      SELECT f.friend_id userId, ui.nickname, ui.avatar_url avatarUrl
      FROM friends f
      INNER JOIN userInfo ui ON ui.user_id = f.friend_id
      WHERE f.user_id = :userId
    `
    const result = await this.sequelize.query(contactListSelect, {
      replacements: { ...id },
      type: QueryTypes.SELECT,
    })
    return result
  }

  async deleteContact(ids: DeleteContact) {
    const contactDelete = `DELETE FROM friends WHERE user_id = :userId AND friend_id = :friendId`
    const result = await this.sequelize.transaction(async (t) => {
      await this.sequelize.query(contactDelete, {
        replacements: { userId: ids.userId, friendId: ids.friendId },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      await this.sequelize.query(contactDelete, {
        replacements: { userId: ids.friendId, friendId: ids.userId },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      return true
    })
    return result
  }

  async getContactListAboutGroup(ids: ContactListAboutGroup) {
    const contactListSelect = `
      SELECT f.friend_id userId, ui.nickname name, ui.avatar_url avatarUrl, IF(ugg.userId, 1, 0) isMember
      FROM friends f
      INNER JOIN userInfo ui ON ui.user_id = f.friend_id
      LEFT JOIN (
        SELECT ug.group_id groupId, ug.user_id userId
        FROM user_group ug
        WHERE ug.group_id = :groupId
      ) ugg ON ugg.userId = f.friend_id
      WHERE f.user_id = :userId
    `
    const result = await this.sequelize.query(contactListSelect, {
      replacements: { ...ids },
      type: QueryTypes.SELECT,
    })
    return result
  }
}
