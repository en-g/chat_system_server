import { Controller, Post, Get, Query, Request, UseGuards, Put, Body } from '@nestjs/common'
import { AuthService } from '../auth/auth.service'
import { LocalAuthGuard } from '../auth/local-auth.guard'
import { LoginInfo, PassInfo, RegisterInfo, RegisterUserInfo, RegisterUserRandomInfo } from './dto/login.dto'
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

  // 修改密码
  @Put('update')
  async updatePassword(@Body() passInfo: PassInfo) {
    return await this.loginService.updatePassword(passInfo)
  }

  // 用户注册
  @Post('register')
  async userRegister(@Body() registerInfo: RegisterInfo) {
    return await this.loginService.userRegister(registerInfo)
  }

  // 获取注册默认头像列表
  @Get('register/avatar/list')
  async getRegisterAvatarList() {
    return await this.loginService.getRegisterAvatarList()
  }

  // 填写注册用户的个人信息
  @Post('register/info')
  async writeUserRegisterInfo(@Body() info: RegisterUserInfo) {
    return await this.loginService.writeUserRegisterInfo(info)
  }

  // 随机生成注册用户的个人信息
  @Post('register/random/info')
  async randomUserRegisterInfo(@Body() id: RegisterUserRandomInfo) {
    return await this.loginService.randomUserRegisterInfo(id)
  }
}
