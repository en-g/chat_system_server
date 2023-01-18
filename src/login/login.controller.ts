import { Controller, Post, Get, Query, Request, UseGuards } from '@nestjs/common'
import { AuthService } from '../auth/auth.service'
import { LocalAuthGuard } from '../auth/local-auth.guard'
import { LoginInfo } from './dto/login.dto'
import { LoginService } from './login.service'

@Controller('login')
export class LoginController {
  constructor(private readonly authService: AuthService, private readonly loginService: LoginService) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  async login(@Request() req) {
    return await this.authService.login(req.user)
  }

  // 查询用户是否存在
  @Get('search')
  async loginSearch(@Query() info: LoginInfo) {
    return await this.loginService.loginSearch(info)
  }
}
