import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  AgreeAddContactInfo,
  FriendInfoIds,
  FriendListId,
  GetAllContactInfo,
  RefuseAddContactInfo,
  SearchFriendAndGroupsByKeyword,
  UpdateFriendRemarksInfo,
} from './dto/friends.dto'
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

  // 搜索联系人/群聊，写在一起
  @Get('groups/search')
  async searchFriendsAndGroups(@Query() info: SearchFriendAndGroupsByKeyword) {
    return this.friendsService.searchFriendsAndGroups(info)
  }

  // 同意添加联系人
  @Post('agree')
  async agreeAddContact(@Body() info: AgreeAddContactInfo) {
    return await this.friendsService.agreeAddContact(info)
  }

  // 拒绝添加联系人
  @Put('refuse')
  async refuseAddContact(@Body() id: RefuseAddContactInfo) {
    return await this.friendsService.refuseAddContact(id)
  }

  // 后去所有联系人简单信息
  @Get('all/:userId')
  async getAllContactInfo(@Param() id: GetAllContactInfo) {
    return await this.friendsService.getAllContactInfo(id)
  }
}
