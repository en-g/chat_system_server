import { Body, Controller, Get, Post, Query, Param } from '@nestjs/common'
import {
  GetCollectionListId,
  GetMessageListId,
  GetNewLifeTidingsListId,
  GetRegardListId,
  GetUserCenterInfo,
  GetUserLifeTidingsListId,
  GetUserLifeTidingsListInfo,
  LifeTidingsInfo,
} from './dto/life.dto'
import { LifeService } from './life.service'

@Controller('life')
export class LifeController {
  constructor(private readonly lifeService: LifeService) {}

  // 获取最新动态列表
  @Get('list/new')
  async getNewLifeTidingsList(@Query() info: GetNewLifeTidingsListId) {
    return await this.lifeService.getNewLifeTidingsList(info)
  }

  // 获取热门动态列表
  @Get('list/hot')
  async getHotLifeTidingsList(@Query() info: GetNewLifeTidingsListId) {
    return await this.lifeService.getHotLifeTidingsList(info)
  }

  // 获取个人动态列表
  @Get('list/:userId')
  async getUserLifeTidingsList(@Param() id: GetUserLifeTidingsListId, @Query() info: GetUserLifeTidingsListInfo) {
    return await this.lifeService.getUserLifeTidingsList(id, info)
  }

  // 获取用户个人中心信息
  @Get('center/info')
  async getUserCenterInfo(@Query() ids: GetUserCenterInfo) {
    return await this.lifeService.getUserCenterInfo(ids)
  }

  // 获取关注列表
  @Get('regard/list/:userId')
  async getRegardsList(@Param() id: GetRegardListId) {
    return await this.lifeService.getRegardsList(id)
  }

  // 获取消息列表
  @Get('message/list/:userId')
  async getMessagesList(@Param() id: GetMessageListId) {
    return await this.lifeService.getMessagesList(id)
  }

  // 获取收藏列表
  @Get('collection/list/:userId')
  async getCollectionsList(@Param() id: GetCollectionListId) {
    return await this.lifeService.getCollectionsList(id)
  }

  // 发布动态
  @Post()
  async releaseLifeTidings(@Body() info: LifeTidingsInfo) {
    return await this.lifeService.releaseLifeTidings(info)
  }
}
