import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AgreeAddGropId, GroupInfoIds, GroupsListId, RefuseAddGropId, UpdateGroupRemarksInfo } from './dto/groups.dto'
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
}
