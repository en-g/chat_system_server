import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import {
  AddContactApplication,
  AddGroupApplication,
  ChatMessageInfo,
  ClientId,
  Clients,
  UpdateContactListId,
  UpdateGroupListId,
} from './dto/websocket.dto'
import { WebsocketService } from './websocket.service'
import { MessageService } from '../message/message.service'

@WebSocketGateway(3002, { cors: true })
export class WebsocketGateway {
  clients: Clients = {}
  heartbeatTimer: any = null
  constructor(private readonly websocketService: WebsocketService, private readonly messageService: MessageService) {}

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

  // 添加群聊
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

  // 更新联系人列表
  @SubscribeMessage('updateContactList')
  async onUpdatecontactList(@MessageBody() id: UpdateContactListId) {
    for (const cliendId of Object.keys(this.clients)) {
      if (this.clients[cliendId].userId === id.userId) {
        this.clients[cliendId].socket.emit('updateContactList')
        break
      }
    }
  }

  // 更新群聊列表
  @SubscribeMessage('updateGroupList')
  async onUpdateGroupList(@MessageBody() id: UpdateGroupListId) {
    for (const cliendId of Object.keys(this.clients)) {
      if (this.clients[cliendId].userId === id.userId) {
        this.clients[cliendId].socket.emit('updateGroupList')
        break
      }
    }
  }

  // 聊天
  @SubscribeMessage('chat')
  async onChat(@MessageBody() info: ChatMessageInfo) {
    if (info.isContact) {
      // 如果是联系人之间的聊天
      // 对方在线，就将消息转发过去
      for (const cliendId of Object.keys(this.clients)) {
        if (this.clients[cliendId].userId === info.toId) {
          this.clients[cliendId].socket.emit('chat', info)
          break
        }
      }
      // 保存消息
      this.messageService.saveContactChatMessage({
        fromId: info.fromId,
        toId: info.toId,
        type: info.type,
        message: info.message,
        url: info.url,
      })
    } else {
      // 如果是群聊的聊天
      // 遍历群所有的成员，对在线的成员进行转发

      // 测试
      for (const cliendId of Object.keys(this.clients)) {
        if (this.clients[cliendId].userId === 1) {
          this.clients[cliendId].socket.emit('chat', info)
          break
        }
      }

      // 保存消息
      this.messageService.saveGroupChatMessage({
        groupId: info.groupId,
        sendId: info.fromId,
        type: info.type,
        message: info.message,
        url: info.url,
      })
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
