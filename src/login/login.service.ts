import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { LoginInfo, PassInfo, RegisterInfo } from './interface/login.interface'

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

  async userRegister(registerInfo: RegisterInfo) {
    const emailSelect = `SELECT * FROM users WHERE email = :email`
    const usernameSelect = `SELECT * FROM users WHERE username = :username`
    const usersInsert = `INSERT INTO users (username, password, email) VALUES (:username, :password, :email)`
    const emailSelectRes = await this.sequelize.query(emailSelect, {
      replacements: { ...registerInfo },
      type: QueryTypes.SELECT,
    })
    // 邮箱重复
    if (emailSelectRes.length > 0) {
      return {
        type: 1,
      }
    }
    const usernameSelectRes = await this.sequelize.query(usernameSelect, {
      replacements: { ...registerInfo },
      type: QueryTypes.SELECT,
    })
    // 用户名重复
    if (usernameSelectRes.length > 0) {
      return {
        type: 2,
      }
    }
    const usersInsertRes = await this.sequelize.query(usersInsert, {
      replacements: { ...registerInfo },
      type: QueryTypes.INSERT,
    })
    if (!!usersInsertRes[1]) {
      // 注册成功
      return {
        type: 0,
        id: usersInsertRes[0],
      }
    } else {
      // 注册失败
      return {
        type: 3,
      }
    }
  }
}
