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
    const verificationCodeSelect = `SELECT * FROM verificationCode WHERE email = :email AND code = :code`
    const passwordUpdate = `UPDATE users SET password = :newPass WHERE email = :email AND username = :username`
    const verificationCodeDelete = `DELETE FROM verificationCode WHERE email = :email`
    const verificationCodeSelectRes: any = await this.sequelize.query(verificationCodeSelect, {
      replacements: {
        email: passInfo.email,
        code: passInfo.verificationCode,
      },
      type: QueryTypes.SELECT,
    })
    if (!verificationCodeSelectRes.length) {
      // 验证码错误
      return {
        status: 2,
      }
    }
    const Interval = new Date().getTime() - verificationCodeSelectRes[0].createAt.getTime()
    if (Interval > 5 * 60 * 1000) {
      // 验证码已过期
      return {
        status: 3,
      }
    }
    const passwordUpdateRes = await this.sequelize.query(passwordUpdate, {
      replacements: { ...passInfo },
      type: QueryTypes.UPDATE,
    })
    await this.sequelize.query(verificationCodeDelete, {
      replacements: { ...passInfo },
      type: QueryTypes.DELETE,
    })
    return {
      status: passwordUpdateRes[1],
    }
  }

  async userRegister(registerInfo: RegisterInfo) {
    const emailSelect = `SELECT * FROM users WHERE email = :email`
    const usernameSelect = `SELECT * FROM users WHERE username = :username`
    const verificationCodeSelect = `SELECT * FROM verificationCode WHERE email = :email AND code = :code`
    const usersInsert = `INSERT INTO users (username, password, email) VALUES (:username, :password, :email)`
    const verificationCodeDelete = `DELETE FROM verificationCode WHERE email = :email`
    const emailSelectRes = await this.sequelize.query(emailSelect, {
      replacements: { ...registerInfo },
      type: QueryTypes.SELECT,
    })
    // 邮箱重复
    if (emailSelectRes.length > 0) {
      return {
        status: 2,
      }
    }
    const usernameSelectRes = await this.sequelize.query(usernameSelect, {
      replacements: { ...registerInfo },
      type: QueryTypes.SELECT,
    })
    // 用户名重复
    if (usernameSelectRes.length > 0) {
      return {
        status: 3,
      }
    }
    const verificationCodeSelectRes: any = await this.sequelize.query(verificationCodeSelect, {
      replacements: {
        email: registerInfo.email,
        code: registerInfo.verificationCode,
      },
      type: QueryTypes.SELECT,
    })
    if (!verificationCodeSelectRes.length) {
      // 验证码错误
      return {
        status: 4,
      }
    }
    const Interval = new Date().getTime() - verificationCodeSelectRes[0].createAt.getTime()
    if (Interval > 5 * 60 * 1000) {
      // 验证码已过期
      return {
        status: 5,
      }
    }
    const usersInsertRes = await this.sequelize.query(usersInsert, {
      replacements: { ...registerInfo },
      type: QueryTypes.INSERT,
    })
    await this.sequelize.query(verificationCodeDelete, {
      replacements: { ...registerInfo },
      type: QueryTypes.DELETE,
    })
    if (!!usersInsertRes[1]) {
      // 注册成功
      return {
        status: 1,
        id: usersInsertRes[0],
      }
    } else {
      // 注册失败
      return {
        status: 0,
      }
    }
  }
}
