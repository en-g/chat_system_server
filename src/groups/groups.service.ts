import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { GroupsListId } from './interface/groups.interface'

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
}
