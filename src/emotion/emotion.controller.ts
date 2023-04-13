import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { EmotionList, UploadEmotion } from './dto/emotion.dto'
import { EmotionService } from './emotion.service'

@Controller('emotion')
export class EmotionController {
  constructor(private readonly emotionService: EmotionService) {}

  @Get('list/:userId')
  async getEmotionList(@Param() id: EmotionList) {
    return await this.emotionService.getEmotionList(id)
  }

  @Post()
  async uploadEmotion(@Body() ids: UploadEmotion) {
    return this.emotionService.uploadEmotion(ids)
  }
}
