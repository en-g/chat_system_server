import { Injectable } from '@nestjs/common'

@Injectable()
export class EmailService {
  async sendEmialVerificationCode() {}

  async sendUserRegisterVerificationCode() {}
}
