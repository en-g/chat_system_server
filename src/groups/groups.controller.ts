import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { GroupsListId } from './dto/groups.dto'
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
}
