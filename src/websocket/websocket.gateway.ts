import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { AddContactApplication, AddGroupApplication, ClientId, ClientItem, Clients } from './dto/websocket.dto'
import { WebsocketService } from './websocket.service'

@WebSocketGateway(3002, { cors: true })
export class WebsocketGateway {
  clients: Clients = {}
  heartbeatTimer: any = null
  constructor(private readonly websocketService: WebsocketService) {}

  // 客户端连接
  @SubscribeMessage('connection')
  onClientConnect(@ConnectedSocket() client: any, @MessageBody() id: ClientId) {
    this.clients[client.id] = {
      userId: id.userId,
      socket: client,
      isConnect: true,
    }

    // 客户端断开连接
    client.on('disconnect', () => {
      Reflect.deleteProperty(this.clients, client.id)
      console.log(`${id.userId} ${client.id} 断开连接！`)
    })

    // this.heartbeatToClient()
  }

  // 添加联系人
  @SubscribeMessage('addContact')
  async onAddContact(@MessageBody() info: AddContactApplication) {
    const res = await this.websocketService.setContactNotice(info)
    if (!!res[1]) {
      for (const clientId of Object.keys(this.clients)) {
        if (this.clients[clientId].userId === info.toId) {
          const detail = await this.websocketService.getContactNoticeDetail(res[0])
          this.clients[clientId].socket.emit('addContactNotice', detail)
          break
        }
      }
    }
  }

  // 添加联系人
  @SubscribeMessage('addGroup')
  async onAddGroup(@MessageBody() info: AddGroupApplication) {
    const res = await this.websocketService.setGroupNotice(info)
    if (!!res[1]) {
      for (const clientId of Object.keys(this.clients)) {
        if (this.clients[clientId].userId === info.toId) {
          const detail = await this.websocketService.getGroupNoticeDetail(res[0])
          this.clients[clientId].socket.emit('addGroupNotice', detail)
          break
        }
      }
    }
  }

  // 回应客户端的连接确认
  @SubscribeMessage('serverCheck')
  onServerCheck(@ConnectedSocket() client: any) {
    client.emit('serverCheck')
  }

  // 回应客户端的连接确认
  @SubscribeMessage('clientCheck')
  onClientCheck(@ConnectedSocket() client: any) {
    Object.keys(this.clients).forEach((clientId: string) => {
      if (this.clients[clientId] && clientId === client.id) {
        this.clients[clientId].isConnect = true
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
