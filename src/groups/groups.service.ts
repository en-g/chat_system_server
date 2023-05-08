import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import {
  AgreeAddGropId,
  CreateGroupInfo,
  DismissGroup,
  ExitGroup,
  GroupInfoIds,
  GroupsListId,
  RefuseAddGropId,
  UpdateGroupNameInfo,
  UpdateGroupNoticeInfo,
  UpdateGroupRemarksInfo,
} from './interface/groups.interface'

@Injectable()
export class GroupsService {
  constructor(private sequelize: Sequelize) {}

  async getGroupList(id: GroupsListId) {
    const mySelfGroupListSelect = `
      SELECT c.id, c.name, c.avatar_url avatarUrl
      FROM chatGroups c
      INNER JOIN user_group ug ON ug.group_id = c.id
      WHERE ug.user_id = :userId AND ug.user_id = c.leader_id
    `
    const joinGroupListSelect = `
      SELECT c.id, c.name, c.avatar_url avatarUrl
      FROM chatGroups c
      INNER JOIN user_group ug ON ug.group_id = c.id
      WHERE ug.user_id = :userId AND ug.user_id != c.leader_id
    `
    const mySelfGroupListSelectRes = await this.sequelize.query(mySelfGroupListSelect, {
      replacements: {
        ...id,
      },
      type: QueryTypes.SELECT,
    })
    const joinGroupListSelectRes = await this.sequelize.query(joinGroupListSelect, {
      replacements: {
        ...id,
      },
      type: QueryTypes.SELECT,
    })
    if (mySelfGroupListSelectRes.length === 0 && joinGroupListSelectRes.length === 0) {
      return []
    } else {
      return [
        {
          id: 1,
          name: '我的群聊',
          total: mySelfGroupListSelectRes.length,
          members: mySelfGroupListSelectRes,
        },
        {
          id: 2,
          name: '已加入的群聊',
          total: joinGroupListSelectRes.length,
          members: joinGroupListSelectRes,
        },
      ]
    }
  }

  async getGroupInfo(ids: GroupInfoIds) {
    const groupInfoSelect = `
      SELECT 
        cg.id, 
        cg.number, 
        cg.name, 
        ui.nickname leader,
        ug.remarks,
        cg.avatar_url avatarUrl,
        cg.notice,
        ug.disturb,
        cg.createAt createTime,
        cg.leader_id leaderId,
        cg.leader_id = :userId isLeader,
        ugui.members
      FROM chatGroups cg
      INNER JOIN user_group ug ON ug.group_id = cg.id
      INNER JOIN userInfo ui ON ui.user_id = cg.leader_id
      INNER JOIN (
        SELECT ug.group_id, JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', ui.user_id, 
            'nickname', ui.nickname, 
            'avatarUrl', ui.avatar_url, 
            'remarks', ug.remarks
          )
        ) members
        FROM user_group ug
        INNER JOIN userInfo ui ON ui.user_id = ug.user_id
        GROUP BY ug.group_id
      ) ugui ON ugui.group_id = cg.id
      WHERE ug.group_id = :groupId AND ug.user_id = :userId
    `
    const result = await this.sequelize.query(groupInfoSelect, {
      replacements: {
        ...ids,
      },
      type: QueryTypes.SELECT,
    })
    return result.length === 0 ? null : result[0]
  }

  async updateGroupName(info: UpdateGroupNameInfo) {
    const groupNameUpdate = `UPDATE chatGroups SET name = :name WHERE leader_id = :userId AND id = :groupId`
    const result = await this.sequelize.query(groupNameUpdate, {
      replacements: { ...info },
      type: QueryTypes.UPDATE,
    })
    return !!result[1]
  }

  async updateGroupRemarks(info: UpdateGroupRemarksInfo) {
    const groupRemarksUpdate = `UPDATE user_group SET remarks = :remarks WHERE user_id = :userId AND group_id = :groupId`
    const result = await this.sequelize.query(groupRemarksUpdate, {
      replacements: {
        ...info,
      },
      type: QueryTypes.UPDATE,
    })
    return !!result[1]
  }

  async updateGroupNotice(info: UpdateGroupNoticeInfo) {
    const groupNoticeUpdate = `UPDATE chatGroups SET notice = :notice WHERE leader_id = :userId AND id = :groupId`
    const result = await this.sequelize.query(groupNoticeUpdate, {
      replacements: { ...info },
      type: QueryTypes.UPDATE,
    })
    return !!result[1]
  }

  async agreeAddGroup(id: AgreeAddGropId) {
    const noticeSelect = `
      SELECT from_id fromId, to_id toId, group_id groupId, type
      FROM groupNotices
      WHERE id = :noticeId
    `
    const noticeUpdate = `UPDATE groupNotices SET status = 1 WHERE id = :noticeId`
    const groupInsert = `INSERT INTO user_group (user_id, group_id) VALUES (:userId, :groupId)`
    const chatMessageInsert = `INSERT INTO groupChatMessages (group_id, send_id, type, message) VALUES (:groupId, :userId, 1, '大家好，请多多指教！')`
    const result = await this.sequelize.transaction(async (t) => {
      const noticeSelectRes: any[] = await this.sequelize.query(noticeSelect, {
        replacements: { noticeId: id.noticeId },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      if (noticeSelectRes.length === 0) return false
      let userId = -1
      if (noticeSelectRes[0].type === 'add') {
        userId = noticeSelectRes[0].fromId
      } else if (noticeSelectRes[0].type === 'invite') {
        userId = noticeSelectRes[0].toId
      }
      const noticeUpdateRes = await this.sequelize.query(noticeUpdate, {
        replacements: { noticeId: id.noticeId },
        type: QueryTypes.UPDATE,
        transaction: t,
      })
      const groupInsertRes = await this.sequelize.query(groupInsert, {
        replacements: {
          userId,
          groupId: noticeSelectRes[0].groupId,
        },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      const ChatMessageInsert = await this.sequelize.query(chatMessageInsert, {
        replacements: {
          userId,
          groupId: noticeSelectRes[0].groupId,
        },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      return !!noticeUpdateRes[1] && !!groupInsertRes[1] && !!ChatMessageInsert[1]
    })
    return result
  }

  async refuseAddGroup(id: RefuseAddGropId) {
    const noticeUpdate = `UPDATE groupNotices SET status = 2 WHERE id = :noticeId`
    const result = await this.sequelize.query(noticeUpdate, {
      replacements: { ...id },
      type: QueryTypes.UPDATE,
    })
    return !!result[1]
  }

  async getGroupDefaultAvatarList() {
    const avatarListSelect = `SELECT id, url FROM files WHERE url LIKE '%defaultGroupAvatar%'`
    const result = await this.sequelize.query(avatarListSelect, {
      type: QueryTypes.SELECT,
    })
    return result
  }

  async createGroup(info: CreateGroupInfo) {
    const createGroupInsert = `INSERT INTO chatGroups (leader_id, number, name, avatar_url) VALUES (:leaderId, :number, :name, :avatarUrl)`
    const userGroupInsert = `INSERT INTO user_group (user_id, group_id) VALUES (:userId, :groupId)`
    const number = this.createRandomNumber()
    const result = await this.sequelize.transaction(async (t) => {
      const createGroupInsertRes = await this.sequelize.query(createGroupInsert, {
        replacements: { ...info, number },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      if (!createGroupInsertRes[1]) {
        return false
      }
      const groupId = createGroupInsertRes[0]
      let res = true
      for (const userId of info.members) {
        const userGroupInsertRes = await this.sequelize.query(userGroupInsert, {
          replacements: { userId, groupId },
          type: QueryTypes.INSERT,
          transaction: t,
        })
        res = res && !!userGroupInsertRes[1]
      }
      return {
        status: res,
        groupId,
      }
    })
    return result
  }

  createRandomNumber() {
    return (Math.random() * 10000000000).toString().split('.')[0]
  }

  async exitGroup(ids: ExitGroup) {
    const exitGroupDelete = `DELETE FROM user_group WHERE user_id = :userId AND group_id = :groupId`
    await this.sequelize.query(exitGroupDelete, {
      replacements: { ...ids },
      type: QueryTypes.DELETE,
    })
    return true
  }

  async dismissGroup(ids: DismissGroup) {
    // const gropDelete = `DELETE FROM chatGroups WHERE leader_id = :leaderId AND id = :groupId`
    const userDelete = `DELETE FROM user_group WHERE group_id = :groupId`
    const result = await this.sequelize.transaction(async (t) => {
      // await this.sequelize.query(gropDelete, {
      //   replacements: { ...ids },
      //   type: QueryTypes.DELETE,
      //   transaction: t,
      // })
      await this.sequelize.query(userDelete, {
        replacements: { ...ids },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      return true
    })
    return result
  }
}
