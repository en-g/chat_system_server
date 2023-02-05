import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import {
  DeletePyqTidingsId,
  FriendPyqTidingsListInfo,
  PyqTidingsInfo,
  PyqTidingsListId,
  PyqTidingsListPage,
  SendPyqTidingsCommentInfo,
  ThumbsUpPyqTidingsIds,
} from './dto/pyq.dto'
import { PyqService } from './pyq.service'

@Controller('pyq')
export class PyqController {
  constructor(private readonly pyqService: PyqService) {}

  // 获取朋友圈动态列表
  @Get('list/:userId')
  async getPyqTidingsList(@Param() id: PyqTidingsListId, @Query() page: PyqTidingsListPage) {
    return await this.pyqService.getPyqTidingsList(id, page)
  }

  // 获取好友动态列表
  @Get('list')
  async getFriendPyqTidingsList(@Query() info: FriendPyqTidingsListInfo) {
    return await this.pyqService.getFriendPyqTidingsList(info)
  }

  // 发布动态
  @Post()
  async releasePyqTidings(@Body() info: PyqTidingsInfo) {
    return await this.pyqService.releasePyqTidings(info)
  }

  // 删除动态
  @Delete()
  async deletePyqTiding(@Body() id: DeletePyqTidingsId) {
    return await this.pyqService.deletePyqTiding(id)
  }

  // 点赞动态
  @Post('thumbs')
  async thumsUpTiding(@Body() ids: ThumbsUpPyqTidingsIds) {
    return await this.pyqService.thumsUpTiding(ids)
  }

  // 取消点赞动态
  @Delete('thumbs')
  async cancleThumsUpTiding(@Body() ids: ThumbsUpPyqTidingsIds) {
    return await this.pyqService.cancleThumsUpTiding(ids)
  }

  // 发送评论
  @Post('comment')
  async sendTidingComment(@Body() info: SendPyqTidingsCommentInfo) {
    return await this.pyqService.sendTidingComment(info)
  }
}
