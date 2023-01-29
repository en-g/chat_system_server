import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { PersonalInfo, PersonalInfoId } from './dto/users.dto'
import { UsersService } from './users.service'

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 获取个人信息
  @Get('personal/info/:userId')
  async getPersonalInfo(@Param() id: PersonalInfoId) {
    return await this.usersService.getPersonalInfo(id)
  }

  // 修改个人信息
  @Put('personal/info')
  async updatePersonalInfo(@Body() info: PersonalInfo) {
    return await this.usersService.updatePersonalInfo(info)
  }
}
