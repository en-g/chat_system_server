import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { PersonalInfo, PersonalInfoId, UserLogin } from './interface/users.interface'

@Injectable()
export class UsersService {
  constructor(private sequelize: Sequelize) {}

  // 查询用户是否存在
  async searchUser(info: UserLogin) {
    const userSelect = `SELECT id, username, password, email FROM users WHERE (username = :username OR email = :username) AND password = :password`
    const result = await this.sequelize.query(userSelect, {
      replacements: { ...info },
      type: QueryTypes.SELECT,
    })
    return result[0]
  }

  async getPersonalInfo(id: PersonalInfoId) {
    const personalInfoSelect = `
      SELECT 
        u.id, 
        u.username, 
        ui.nickname, 
        ui.avatar_url avatarUrl, 
        ui.sex, 
        ui.signature,
        ui.birthday,
        u.email
      FROM users u
      INNER JOIN userInfo ui ON ui.user_id = u.id
      WHERE u.id = :userId
    `
    const result: any[] = await this.sequelize.query(personalInfoSelect, {
      replacements: { ...id },
      type: QueryTypes.SELECT,
    })
    return result[0]
  }

  async updatePersonalInfo(info: PersonalInfo) {
    const userInfoUpdate = `
      UPDATE userInfo 
      SET nickname = :nickname, avatar_url = :avatarUrl, sex = :sex, signature = :signature, birthday = :birthday 
      WHERE user_id = :userId
    `
    const usersUpdate = `UPDATE users SET email = :email WHERE id = :userId`
    const result = await this.sequelize.transaction(async (t) => {
      const userInfoUpdateRes = await this.sequelize.query(userInfoUpdate, {
        replacements: { ...info },
        type: QueryTypes.UPDATE,
        transaction: t,
      })
      await this.sequelize.query(usersUpdate, {
        replacements: { ...info },
        type: QueryTypes.UPDATE,
        transaction: t,
      })
      return !!userInfoUpdateRes[1]
    })

    return result
  }
}
