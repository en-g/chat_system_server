import { Body, Controller, Get, Post, Query, Param, Delete } from '@nestjs/common'
import {
  CollectLifeTidingsIds,
  CommentLifeTidingsInfo,
  DeleteLifeTidingsId,
  FansListId,
  GetCollectionListId,
  GetMessageListId,
  GetNewLifeTidingsListId,
  GetRegardListId,
  GetUserCenterInfo,
  GetUserLifeTidingsListId,
  GetUserLifeTidingsListInfo,
  LifeMessageCountId,
  LifeTidingDetailId,
  LifeTidingsInfo,
  RegardUserIds,
  ReplyLifeTidingsInfo,
  ThumbsUpCommentIds,
  ThumbsUpLifeTidingsIds,
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

  // 点赞动态
  @Post('thumbs')
  async thumbsLifeTidings(@Body() ids: ThumbsUpLifeTidingsIds) {
    return await this.lifeService.thumbsLifeTidings(ids)
  }

  // 取消点赞
  @Delete('thumbs')
  async deleteThumbsLifeTidings(@Body() ids: ThumbsUpLifeTidingsIds) {
    return await this.lifeService.deleteThumbsLifeTidings(ids)
  }

  // 收藏动态
  @Post('collect')
  async collectLifeTidings(@Body() ids: CollectLifeTidingsIds) {
    return await this.lifeService.collectLifeTidings(ids)
  }

  // 取消收藏动态
  @Delete('collect')
  async deleteCollectLifeTidings(@Body() ids: CollectLifeTidingsIds) {
    return await this.lifeService.deleteCollectLifeTidings(ids)
  }

  // 删除动态
  @Delete()
  async deleteLifeTidings(@Body() id: DeleteLifeTidingsId) {
    return await this.lifeService.deleteLifeTidings(id)
  }

  // 获取动态详情
  @Get('detail')
  async getLifeTidingDetail(@Query() ids: LifeTidingDetailId) {
    return await this.lifeService.getLifeTidingDetail(ids)
  }

  // 评论
  @Post('comment')
  async commentLifeTidings(@Body() info: CommentLifeTidingsInfo) {
    return await this.lifeService.commentLifeTidings(info)
  }

  // 回复
  @Post('reply')
  async replyLifeTidings(@Body() info: ReplyLifeTidingsInfo) {
    return await this.lifeService.replyLifeTidings(info)
  }

  // 点赞评论
  @Post('comment/thumbs')
  async thumbLifeComment(@Body() ids: ThumbsUpCommentIds) {
    return await this.lifeService.thumbLifeComment(ids)
  }

  // 取消点赞评论
  @Delete('comment/thumbs')
  async cancelthumbLifeComment(@Body() ids: ThumbsUpCommentIds) {
    return await this.lifeService.cancelthumbLifeComment(ids)
  }

  // 获取热门动态列表
  @Get('list/hot/base')
  async getHotBaseLifeTidingsList() {
    return await this.lifeService.getHotBaseLifeTidingsList()
  }

  // 获取消息数
  @Get('messages/count/:userId')
  async getLifeMessageCount(@Param() id: LifeMessageCountId) {
    return await this.lifeService.getLifeMessageCount(id)
  }

  // 关注
  @Post('regard')
  async regardUser(@Body() ids: RegardUserIds) {
    return await this.lifeService.regardUser(ids)
  }

  // 取消关注
  @Delete('regard')
  async cancelRegardUser(@Body() ids: RegardUserIds) {
    return await this.lifeService.cancelRegardUser(ids)
  }

  // 获取粉丝列表
  @Get('fans/list/:userId')
  async getFansList(@Param() id: FansListId) {
    return await this.lifeService.getFansList(id)
  }
}
