import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { createEmailConnection } from './emial'
import { RegisterCode, UploadPassWordCode } from './interface/email.interface'

@Injectable()
export class EmailService {
  constructor(private sequelize: Sequelize) {}

  async sendUpdatePassVerificationCode(code: UploadPassWordCode) {
    const emailSelect = `SELECT * FROM users WHERE email = :email AND username = :username`
    const verificationCodeInsert = `INSERT INTO verificationCode (email, code) VALUES (:email, :code)`
    const emailSelectRes = await this.sequelize.query(emailSelect, {
      replacements: {
        ...code,
      },
      type: QueryTypes.SELECT,
    })
    // 邮箱不存在
    if (emailSelectRes.length === 0) {
      return {
        status: 2,
      }
    }
    const verificationCode = this.generateRandomCode()
    const verificationCodeInsertRes = await this.sequelize.query(verificationCodeInsert, {
      replacements: {
        email: code.email,
        code: verificationCode,
      },
      type: QueryTypes.INSERT,
    })
    if (!!verificationCodeInsertRes[1]) {
      const res = await this.sendUpdatePassCode(code.email, code.username, verificationCode)
      if (res) {
        // 发送成功
        return {
          status: 1,
        }
      } else {
        // 发送失败
        return {
          status: 0,
        }
      }
    }
    // 发送失败
    return {
      status: 0,
    }
  }

  async sendUserRegisterVerificationCode(code: RegisterCode) {
    const verificationCodeInsert = `INSERT INTO verificationCode (email, code) VALUES (:email, :code)`
    const verificationCode = this.generateRandomCode()
    const verificationCodeInsertRes = await this.sequelize.query(verificationCodeInsert, {
      replacements: {
        email: code.email,
        code: verificationCode,
      },
      type: QueryTypes.INSERT,
    })
    if (!!verificationCodeInsertRes[1]) {
      const res = await this.sendUserRegisterCode(code.email, code.username, verificationCode)
      if (res) {
        // 发送成功
        return {
          status: 1,
        }
      } else {
        // 发送失败
        return {
          status: 0,
        }
      }
    }
    // 发送失败
    return {
      status: 0,
    }
  }

  // 生成随机验证码
  generateRandomCode() {
    const code = Math.floor(Math.random() * 999999).toString()
    return code
  }

  // 发送修改密码的验证码
  async sendUpdatePassCode(email: string, username: string, code: string) {
    const transporter = createEmailConnection(process.env.EMAIL_AUTH_USER, process.env.EMAIL_AUTH_PASS)
    const res = await transporter.sendUpdatePassCode(email, username, code)
    return res
  }

  // 发送用户注册的验证码
  async sendUserRegisterCode(email: string, username: string, code: string) {
    const transporter = createEmailConnection(process.env.EMAIL_AUTH_USER, process.env.EMAIL_AUTH_PASS)
    const res = await transporter.sendUserRegisterCode(email, username, code)
    return res
  }
}
