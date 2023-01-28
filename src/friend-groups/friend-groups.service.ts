import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import {
  AddFriendGroup,
  DeleteFriendGroup,
  FriendGroupListId,
  UpdateFriendGroup,
} from './interface/friend-groups.interface'

@Injectable()
export class FriendGroupsService {
  constructor(private sequelize: Sequelize) {}

  async getFriendGroupsList(id: FriendGroupListId) {
    const friendGroupsListSelect = `
      SELECT fg.id, fg.name, IFNULL(ff.total, 0) total
      FROM friendGroups fg
      LEFT JOIN (
        SELECT COUNT(*) total, f.friendGroup_id
        FROM friends f
        GROUP BY f.friendGroup_id
      ) ff ON ff.friendGroup_id = fg.id
      WHERE fg.user_id = :userId
    `
    const result = await this.sequelize.query(friendGroupsListSelect, {
      replacements: {
        ...id,
      },
      type: QueryTypes.SELECT,
    })
    return result
  }

  async addFriendGroup(info: AddFriendGroup) {
    const friendGroupSelect = `SELECT * FROM friendGroups WHERE user_id = :userId AND name = :name`
    const friendGroupInsert = `INSERT INTO friendGroups (user_id, name) VALUES (:userId, :name)`
    const friendGroupSelectRes = await this.sequelize.query(friendGroupSelect, {
      replacements: {
        ...info,
      },
      type: QueryTypes.SELECT,
    })
    if (friendGroupSelectRes.length > 0) {
      return {
        status: 2,
      }
    }
    const friendGroupInsertRes = await this.sequelize.query(friendGroupInsert, {
      replacements: {
        ...info,
      },
      type: QueryTypes.INSERT,
    })
    return {
      status: friendGroupInsertRes[1],
      id: friendGroupInsertRes[0],
    }
  }

  async deleteFriendGroup(ids: DeleteFriendGroup) {
    const friendGroupDelete = `DELETE FROM friendGroups WHERE id = :friendGroupId`
    const friendGroupSelect = `SELECT * FROM friends WHERE user_id = :userId AND friendGroup_id = :friendGroupId`
    const friendGroupUpdate = `UPDATE friends SET friendGroup_id = :newId WHERE user_id = :userId AND friendGroup_id = :friendGroupId`
    const result = await this.sequelize.transaction(async (t) => {
      await this.sequelize.query(friendGroupDelete, {
        replacements: {
          ...ids,
        },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      const friendGroupSelectRes = await this.sequelize.query(friendGroupSelect, {
        replacements: {
          ...ids,
        },
        type: QueryTypes.SELECT,
        transaction: t,
      })
      if (friendGroupSelectRes.length === 0) {
        return true
      }
      const friendGroupUpdateRes = await this.sequelize.query(friendGroupUpdate, {
        replacements: {
          ...ids,
        },
        type: QueryTypes.UPDATE,
        transaction: t,
      })
      return !!friendGroupUpdateRes[1]
    })
    return result
  }

  async updateFriendGroup(info: UpdateFriendGroup) {
    const friendGroupUpdate = `UPDATE friendGroups SET name = :name WHERE id = :friendGroupId AND user_id = userId`
    const result = await this.sequelize.query(friendGroupUpdate, {
      replacements: {
        ...info,
      },
      type: QueryTypes.UPDATE,
    })
    return !!result[1]
  }
}
