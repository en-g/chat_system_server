import { Body, Controller, Post } from '@nestjs/common'
import { MessageService } from './message.service'
import { ContactChatMessageInfo, GroupChatMessageInfo } from './dto/message.dto'

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('contact')
  async saveContactChatMessage(@Body() info: ContactChatMessageInfo) {
    return await this.messageService.saveContactChatMessage(info)
  }

  @Post('group')
  async saveGroupChatMessage(@Body() info: GroupChatMessageInfo) {
    return await this.messageService.saveGroupChatMessage(info)
  }
}
