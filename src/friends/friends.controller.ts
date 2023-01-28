import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FriendInfoIds, FriendListId, UpdateFriendRemarksInfo } from './dto/friends.dto'
import { FriendsService } from './friends.service'

@UseGuards(AuthGuard('jwt'))
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  // 获取联系人列表
  @Get('list/:userId')
  async getFriendList(@Param() userId: FriendListId) {
    return await this.friendsService.getFriendList(userId)
  }

  // 获取联系人信息
  @Get('info')
  async getFriendInfo(@Query() ids: FriendInfoIds) {
    return this.friendsService.getFriendInfo(ids)
  }

  // 修改联系人备注
  @Put('remarks')
  async updateFriendRemarks(@Body() info: UpdateFriendRemarksInfo) {
    return await this.friendsService.updateFriendRemarks(info)
  }
}
