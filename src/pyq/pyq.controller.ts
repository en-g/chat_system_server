import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { FriendPyqTidingsListId, PyqTidingsInfo, PyqTidingsListId } from './dto/pyq.dto'
import { PyqService } from './pyq.service'

@Controller('pyq')
export class PyqController {
  constructor(private readonly pyqService: PyqService) {}

  // 获取朋友圈动态列表
  @Get('list/:userId')
  async getPyqTidingsList(@Param() id: PyqTidingsListId) {
    return await this.pyqService.getPyqTidingsList(id)
  }

  // 获取好友动态列表
  @Get('list')
  async getFriendPyqTidingsList(@Query() id: FriendPyqTidingsListId) {
    return await this.pyqService.getFriendPyqTidingsList(id)
  }

  // 发布动态
  @Post()
  async releasePyqTidings(@Body() info: PyqTidingsInfo) {
    return await this.pyqService.releasePyqTidings(info)
  }
}
