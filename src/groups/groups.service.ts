import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { GroupInfoIds, GroupsListId } from './interface/groups.interface'

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
        cg.createAt createTime,
        cg.leader_id = :userId isLeader
      FROM chatGroups cg
      INNER JOIN user_group ug ON ug.group_id = cg.id AND ug.group_id = :groupId AND ug.user_id = :userId
      INNER JOIN userInfo ui ON ui.user_id = cg.leader_id
    `
    const result = await this.sequelize.query(groupInfoSelect, {
      replacements: {
        ...ids,
      },
      type: QueryTypes.SELECT,
    })
    return result.length === 0 ? null : result[0]
  }
}
