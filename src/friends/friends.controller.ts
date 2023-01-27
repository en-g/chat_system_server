import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FriendInfoIds, FriendListId } from './dto/friends.dto'
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
}
