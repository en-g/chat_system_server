import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  AddFriendGroup,
  DeleteFriendGroup,
  FriendGroupListId,
  UpdateContactFriendGroup,
  UpdateFriendGroup,
} from './dto/friend-groups.dto'
import { FriendGroupsService } from './friend-groups.service'

@UseGuards(AuthGuard('jwt'))
@Controller('friendGroups')
export class FriendGroupsController {
  constructor(private readonly friendGroupsService: FriendGroupsService) {}

  // 获取分组列表
  @Get('list/:userId')
  async getFriendGroupsList(@Param() id: FriendGroupListId) {
    return await this.friendGroupsService.getFriendGroupsList(id)
  }

  // 添加分组
  @Post('add')
  async addFriendGroup(@Body() info: AddFriendGroup) {
    return await this.friendGroupsService.addFriendGroup(info)
  }

  // 删除分组
  @Delete('delete')
  async deleteFriendGroup(@Body() ids: DeleteFriendGroup) {
    return this.friendGroupsService.deleteFriendGroup(ids)
  }

  // 修改分组
  @Put('update')
  async updateFriendGroup(@Body() info: UpdateFriendGroup) {
    return await this.friendGroupsService.updateFriendGroup(info)
  }

  // 修改联系人所在分组
  @Put('contact')
  async updateContactFriendGroup(@Body() ids: UpdateContactFriendGroup) {
    return await this.friendGroupsService.updateContactFriendGroup(ids)
  }
}
