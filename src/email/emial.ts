import { createTransport } from 'nodemailer'

class Email {
  user: string
  pass: string
  transporter: any
  constructor(user: string, pass: string) {
    this.user = user
    this.pass = pass
    const transporter = createTransport({
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
    })
    this.transporter = transporter
  }

  sendUpdatePassCode(email: string, username: string, code: string) {
    const emialInfo = {
      from: `"【去玩】👻"<${this.user}>`,
      to: email,
      subject: '验证码',
      text: `【去玩】您正在【修改账号${username}的密码】, 验证码为${code}。提供给他人可能导致账号被盗, 若非本人操作, 请忽视此条邮件。`,
    }
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(emialInfo, (err: any) => {
        if (err) {
          reject(false)
        } else {
          resolve(true)
        }
      })
    })
  }

  sendUserRegisterCode(email: string, username: string, code: string) {
    const emialInfo = {
      from: `"【去玩】👻"<${this.user}>`,
      to: email,
      subject: '验证码',
      text: `【去玩】您正在【注册账号${username}】, 验证码为${code}。感谢您使用"去玩"聊天系统, 若非本人操作, 请忽视此条邮件。`,
    }
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(emialInfo, (err: any) => {
        if (err) {
          reject(false)
        } else {
          resolve(true)
        }
      })
    })
  }
}

const createEmailConnection = (user: string, pass: string) => {
  const email = new Email(user, pass)
  return email
}

export { createEmailConnection }
