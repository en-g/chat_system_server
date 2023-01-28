import { Controller, Get, Query } from '@nestjs/common'
import { RegisterCode, UploadPassWordCode } from './dto/email.dto'
import { EmailService } from './email.service'

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // 发送修改密码的验证码
  @Get('update')
  async sendUpdatePassVerificationCode(@Query() code: UploadPassWordCode) {
    return await this.emailService.sendUpdatePassVerificationCode(code)
  }

  // 发送用户注册的验证码
  @Get('register')
  async sendUserRegisterVerificationCode(@Query() code: RegisterCode) {
    return await this.emailService.sendUserRegisterVerificationCode(code)
  }
}
