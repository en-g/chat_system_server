import { Module } from '@nestjs/common'
import { WebsocketService } from './websocket.service'
import { WebsocketGateway } from './websocket.gateway'
import { MessageModule } from 'src/message/message.module'

@Module({
  imports: [MessageModule],
  providers: [WebsocketService, WebsocketGateway],
})
export class WebsocketModule {}
