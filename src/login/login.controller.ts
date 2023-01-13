import { Controller, Post, Request, UseGuards } from '@nestjs/common'
import { AuthService } from '../auth/auth.service'
import { LocalAuthGuard } from '../auth/local-auth.guard'

@Controller('login')
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  async login(@Request() req) {
    return await this.authService.login(req.user)
  }
}
