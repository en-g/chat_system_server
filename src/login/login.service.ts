import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { LoginInfo, PassInfo } from './interface/login.interface'

@Injectable()
export class LoginService {
  constructor(private sequelize: Sequelize) {}

  async loginSearch(info: LoginInfo) {
    const userSelect = `SELECT id, username, password, email FROM users WHERE (username = :username OR email = :username) AND password = :password`
    const result = await this.sequelize.query(userSelect, {
      replacements: { ...info },
      type: QueryTypes.SELECT,
    })
    return !!result.length
  }

  async updatePassword(passInfo: PassInfo) {
    const passwordUpdate = `UPDATE users SET password = :newPass WHERE email = :email AND username = :username`
    const result = await this.sequelize.query(passwordUpdate, {
      replacements: { ...passInfo },
      type: QueryTypes.UPDATE,
    })
    return !!result[1]
  }
}
