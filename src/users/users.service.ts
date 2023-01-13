import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { UserLogin } from './interface/users.interface'

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
}
