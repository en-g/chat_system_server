import { Controller, Get, Query, Put, Body } from '@nestjs/common'
import { NoticeService } from './notice.service'
import { ContactNoticeListInfo, GroupNoticeListInfo, ReadNoticeId, UnHandleNoticeInfo } from './dto/notice.dto'

@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  // 获取联系人通知列表
  @Get('contact')
  async getContactNoticeList(@Query() info: ContactNoticeListInfo) {
    return await this.noticeService.getContactNoticeList(info)
  }

  // 获取群聊通知列表
  @Get('group')
  async getGroupNoticeList(@Query() info: GroupNoticeListInfo) {
    return await this.noticeService.getGroupNoticeList(info)
  }

  // 获取通知列表的未处理通知
  @Get('unHandle')
  async getUnHandleNotice(@Query() info: UnHandleNoticeInfo) {
    return await this.noticeService.getUnHandleNotice(info)
  }

  // 通知已阅读
  @Put('read')
  async readNotice(@Body() id: ReadNoticeId) {
    return await this.noticeService.readNotice(id)
  }
}
