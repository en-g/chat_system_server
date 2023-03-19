import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { ClientId, Clients } from './dto/websocket.dto'

@WebSocketGateway(3002, { cors: true })
export class WebsocketGateway {
  clients: Clients = {}
  heartbeatTimer: any = null

  // 客户端连接
  @SubscribeMessage('connection')
  onClientConnect(@ConnectedSocket() client: any, @MessageBody() id: ClientId) {
    this.clients[id.userId] = {
      socketId: client.id,
      socket: client,
      isConnect: true,
    }

    // 客户端断开连接
    client.on('disconnect', () => {
      this.clients[id.userId].socket = null
      console.log(`${id.userId} ${client.id} 断开连接！`)
    })

    // this.heartbeatToClient()
  }

  // 回应客户端的连接确认
  @SubscribeMessage('serverCheck')
  onServerCheck(@ConnectedSocket() client: any) {
    client.emit('serverCheck')
  }

  // 回应客户端的连接确认
  @SubscribeMessage('clientCheck')
  onClientCheck(@ConnectedSocket() client: any) {
    Object.keys(this.clients).forEach((userId: string) => {
      if (this.clients[userId] && this.clients[userId].socketId === client.id) {
        this.clients[userId].isConnect = true
      }
    })
  }

  // 心跳检测
  heartbeatToClient() {
    this.heartbeatTimer = setInterval(() => {
      Object.keys(this.clients).forEach((userId: string) => {
        if (this.clients[userId].socket) {
          if (this.clients[userId].isConnect) {
            // 如果客户端已回应
            this.clients[userId].isConnect = false
            this.clients[userId].socket.emit('clientCheck')
            console.log(`${userId} ${this.clients[userId].socketId} 已回应！`)
          } else {
            // 如果客户端未回应，断开客户端连接
            // this.clients[userId].socket.client.close()
            // console.log(`${userId} ${this.clients[userId].socketId} 未回应，断开连接！`)
            // 更新最后在线时间
          }
        }
      })
    }, 10000)
  }
}
