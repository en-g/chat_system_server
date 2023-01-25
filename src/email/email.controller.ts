import { Controller, Get, Query } from '@nestjs/common'
import { RegisterCode, UploadPassWordCode } from './dto/email.dto'
import { EmailService } from './email.service'

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('update')
  async sendUpdatePassVerificationCode(@Query() code: UploadPassWordCode) {
    return await this.emailService.sendUpdatePassVerificationCode(code)
  }

  @Get('register')
  async sendUserRegisterVerificationCode(@Query() code: RegisterCode) {
    return await this.emailService.sendUserRegisterVerificationCode(code)
  }
}
