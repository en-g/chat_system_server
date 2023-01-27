import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { GroupInfoIds, GroupsListId } from './dto/groups.dto'
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
    return this.groupsService.getGroupInfo(ids)
  }
}
