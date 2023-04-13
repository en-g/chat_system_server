import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  AgreeAddGropId,
  CreateGroupInfo,
  DismissGroup,
  ExitGroup,
  GroupInfoIds,
  GroupsListId,
  RefuseAddGropId,
  UpdateGroupRemarksInfo,
} from './dto/groups.dto'
import { GroupsService } from './groups.service'

@UseGuards(AuthGuard('jwt'))
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // 获取群聊列表
  @Get('list/:userId')
  async getGroupList(@Param() id: GroupsListId) {
    return await this.groupsService.getGroupList(id)
  }

  // 获取群聊信息
  @Get('info')
  async getGroupInfo(@Query() ids: GroupInfoIds) {
    return await this.groupsService.getGroupInfo(ids)
  }

  // 修改用户的群聊群昵称
  @Put('remarks')
  async updateGroupRemarks(@Body() info: UpdateGroupRemarksInfo) {
    return await this.groupsService.updateGroupRemarks(info)
  }

  // 同意进群(用户同意/群主同意)
  @Post('agree')
  async agreeAddGroup(@Body() id: AgreeAddGropId) {
    return await this.groupsService.agreeAddGroup(id)
  }

  // 拒绝进群
  @Put('refuse')
  async refuseAddGroup(@Body() id: RefuseAddGropId) {
    return await this.groupsService.refuseAddGroup(id)
  }

  // 获取群聊默认头像列表
  @Get('defaultAvatar/list')
  async getGroupDefaultAvatarList() {
    return await this.groupsService.getGroupDefaultAvatarList()
  }

  // 创建群聊
  @Post('create')
  async createGroup(@Body() info: CreateGroupInfo) {
    return await this.groupsService.createGroup(info)
  }

  // 退出群聊
  @Delete('exit')
  async exitGroup(@Body() ids: ExitGroup) {
    return await this.groupsService.exitGroup(ids)
  }

  // 解散群聊
  @Delete('dismiss')
  async dismissGroup(@Body() ids: DismissGroup) {
    return await this.groupsService.dismissGroup(ids)
  }
}
