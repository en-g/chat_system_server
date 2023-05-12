import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import {
  AddContactApplication,
  AddContactSuccess,
  AddGroupApplication,
  ChatMessageInfo,
  ClientId,
  Clients,
  CreateGroupApplication,
  DeleteContactApplication,
  DismissGroupApplication,
  EnterGroupInfo,
  ExitGroupApplication,
  GroupsMembers,
  InviteGroupApplication,
  UpdateContactListId,
  UpdateGroupInfoId,
  UpdateGroupListId,
  UpdateLifeMessageCountId,
  UpdatePyqMessageCountId,
} from './dto/websocket.dto'
import { WebsocketService } from './websocket.service'
import { MessageService } from '../message/message.service'

@WebSocketGateway(3004, { cors: true })
export class WebsocketGateway {
  clients: Clients = {}
  groups: GroupsMembers = {}
  heartbeatTimer: any = null
  constructor(private readonly websocketService: WebsocketService, private readonly messageService: MessageService) {}

  // 客户端连接
  @SubscribeMessage('connection')
  async onClientConnect(@ConnectedSocket() client: any, @MessageBody() id: ClientId) {
    console.log(`${id.userId} ${client.id} 连接成功！`)
    this.clients[client.id] = {
      userId: id.userId,
      socket: client,
      isConnect: true,
    }

    // 推送聊天消息
    const offlineChatMessages = await this.websocketService.getOfflineChatMessage(id.userId)
    client.emit('offlineChatMessages', offlineChatMessages)

    // 通知用户删除聊天列表项
    const deleteChatMessageList = await this.websocketService.getDeleteChatMesageItemNotice({ userId: id.userId })
    deleteChatMessageList.forEach((item: any) => {
      client.emit('deleteChatMessageItem', { id: item.chatId, type: item.type })
    })

    // 客户端断开连接
    client.on('disconnect', async () => {
      Reflect.deleteProperty(this.clients, client.id)
      console.log(`${id.userId} ${client.id} 断开连接！`)

      // 更新最后在线时间
      await this.websocketService.updateUserLatestOnlineTime(id.userId)
    })
  }

  // 初始化群的成员id
  async initGroupMemberIds() {
    await this.websocketService.initGroupMemberIds(this.groups)
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

  // 添加联系人成功
  @SubscribeMessage('addContactSuccess')
  async onAddContactSuccess(@MessageBody() ids: AddContactSuccess) {
    const result = await this.websocketService.initContactChatMessage(ids)
    // 双方有人在线的话，就将打招呼的聊天消息推送过去
    const fromClient = Object.values(this.clients).find((client) => client.userId === ids.fromId)
    if (fromClient) {
      fromClient.socket.emit('chat', Object.assign(result.from, { isContact: true }))
      fromClient.socket.emit('chat', Object.assign(result.to, { isContact: true }))
    }
    const toClient = Object.values(this.clients).find((client) => client.userId === ids.toId)
    if (toClient) {
      toClient.socket.emit('chat', Object.assign(result.from, { isContact: true }))
      toClient.socket.emit('chat', Object.assign(result.to, { isContact: true }))
    }
  }

  // 删除联系人
  @SubscribeMessage('deleteContact')
  async onDeleteContact(@MessageBody() info: DeleteContactApplication) {
    // 通知双方删除聊天列表项
    const fromClient = Object.values(this.clients).find((client) => client.userId === info.userId)
    const toClient = Object.values(this.clients).find((client) => client.userId === info.friendId)
    if (fromClient) {
      fromClient.socket.emit('deleteChatMessageItem', { id: info.friendId, type: 'friend' })
    } else {
      await this.websocketService.saveDeleteChatMesageItemNotice({
        userId: info.userId,
        chatId: info.friendId,
        type: 'friend',
      })
    }
    if (toClient) {
      toClient.socket.emit('deleteChatMessageItem', { id: info.userId, type: 'friend' })
    } else {
      await this.websocketService.saveDeleteChatMesageItemNotice({
        userId: info.friendId,
        chatId: info.userId,
        type: 'friend',
      })
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

  // 创建群聊
  @SubscribeMessage('createGroup')
  async onCreateGroup(@MessageBody() info: CreateGroupApplication) {
    // 创建群并添加群成员
    this.groups[info.groupId] || (this.groups[info.groupId] = [...info.members])
    info.members.forEach(async (toId: number) => {
      if (toId === info.userId) return
      const res = await this.websocketService.setGroupNotice({
        fromId: info.userId,
        toId,
        groupId: info.groupId,
        type: 'create',
        message: null,
      })
      if (!!res[1]) {
        const client = Object.values(this.clients).find((client) => client.userId === toId)
        if (client) {
          const detail = await this.websocketService.getGroupNoticeDetail(res[0])
          client.socket.emit('createGroupNotice', detail)
        }
      }
    })
  }

  // 邀请加入群聊
  @SubscribeMessage('inviteGroup')
  async onInviteGroup(@MessageBody() info: InviteGroupApplication) {
    info.inviteIds.forEach(async (toId: number) => {
      const res = await this.websocketService.setGroupNotice({
        fromId: info.userId,
        toId,
        groupId: info.groupId,
        type: 'invite',
        message: null,
      })
      if (!!res[1]) {
        const client = Object.values(this.clients).find((client) => client.userId === toId)
        if (client) {
          const detail = await this.websocketService.getGroupNoticeDetail(res[0])
          client.socket.emit('inviteGroupNotice', detail)
        }
      }
    })
  }

  // 退出群聊
  @SubscribeMessage('exitGroup')
  async onExitGroup(@MessageBody() info: ExitGroupApplication) {
    // 移除群成员
    const members = this.groups[info.groupId]
    if (members) {
      const index = members.find((id: number) => id === info.fromId)
      if (index !== -1) members.splice(index, 1)
    }
    const res = await this.websocketService.setGroupNotice({
      ...info,
      message: null,
    })
    if (!!res[1]) {
      const client = Object.values(this.clients).find((client) => client.userId === info.toId)
      if (client) {
        const detail = await this.websocketService.getGroupNoticeDetail(res[0])
        client.socket.emit('exitGroupNotice', detail)
      }
    }
    // 通知退群的用户删除聊天列表项
    const client = Object.values(this.clients).find((client) => client.userId === info.fromId)
    if (client) {
      client.socket.emit('deleteChatMessageItem', { id: info.groupId, type: 'group' })
    } else {
      await this.websocketService.saveDeleteChatMesageItemNotice({
        userId: info.fromId,
        chatId: info.groupId,
        type: 'group',
      })
    }
  }

  // 解散群聊
  @SubscribeMessage('dismissGroup')
  async onDismissGroup(@MessageBody() info: DismissGroupApplication) {
    if (this.groups[info.groupId]) {
      this.groups[info.groupId].forEach(async (id: number) => {
        // 通知所有群成员删除聊天列表项
        const client = Object.values(this.clients).find((client) => client.userId === id)
        if (client) {
          client.socket.emit('deleteChatMessageItem', { id: info.groupId, type: 'group' })
        } else {
          await this.websocketService.saveDeleteChatMesageItemNotice({
            userId: id,
            chatId: info.groupId,
            type: 'group',
          })
        }
        if (id === info.fromId) return
        const res = await this.websocketService.setGroupNotice({
          fromId: info.fromId,
          toId: id,
          groupId: info.groupId,
          type: info.type,
          message: null,
        })
        if (!!res[1]) {
          const client = Object.values(this.clients).find((client) => client.userId === id)
          if (client) {
            const detail = await this.websocketService.getGroupNoticeDetail(res[0])
            client.socket.emit('updateGroupList')
            client.socket.emit('dismissGroupNotice', detail)
          }
        }
      })
    }
    // 移除群
    if (this.groups[info.groupId]) {
      Reflect.deleteProperty(this.groups, info.groupId)
    }
  }

  // 用户进群
  @SubscribeMessage('enterGroup')
  async onEnterGroup(@MessageBody() info: EnterGroupInfo) {
    const members = this.groups[info.groupId]
    if (members) {
      members.includes(info.userId) || members.push(info.userId)
    }
    const result = await this.websocketService.initGroupChatMessage(info)
    this.groups[info.groupId].forEach((id: number) => {
      const client = Object.values(this.clients).find((client) => client.userId === id)
      client && client.socket.emit('chat', Object.assign(result, { isContact: false }))
    })
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

  // 更新群聊信息
  @SubscribeMessage('updateGroupInfo')
  async onUpdateGroupInfo(@MessageBody() id: UpdateGroupInfoId) {
    const client = Object.values(this.clients).find((client) => client.userId === id.userId)
    console.log(client.userId)
    client && client.socket.emit('updateGroupInfo', { groupId: id.groupId })
  }

  // 聊天
  @SubscribeMessage('chat')
  async onChat(@ConnectedSocket() client: any, @MessageBody() info: ChatMessageInfo) {
    if (info.isContact) {
      // 如果是联系人之间的聊天
      // 保存消息
      const { status, chatMessage } = await this.messageService.saveContactChatMessage({
        fromId: info.fromId,
        toId: info.toId,
        type: info.type,
        message: info.message,
        url: info.url,
      })
      if (status === 0) return
      // 对方在线，就将消息转发过去
      client.emit('chat', Object.assign(chatMessage, { isContact: info.isContact }))
      const toClient = Object.values(this.clients).find((c) => c.userId === info.toId)
      if (toClient) {
        console.log(toClient.userId)
        toClient.socket.emit('chat', Object.assign(chatMessage, { isContact: info.isContact }))
      }
    } else {
      // 如果是群聊的聊天
      // 保存消息
      const { status, chatMessage } = await this.messageService.saveGroupChatMessage({
        groupId: info.groupId,
        sendId: info.fromId,
        type: info.type,
        message: info.message,
        url: info.url,
      })
      if (status === 0) return
      // 遍历群所有的成员，对在线的成员进行转发
      client.emit('chat', Object.assign(chatMessage, { isContact: info.isContact }))
      const members = this.groups[info.groupId]
      if (members) {
        members.forEach((id: number) => {
          if (id === info.fromId) return
          const client = Object.values(this.clients).find((client) => client.userId === id)
          if (client) {
            client.socket.emit('chat', Object.assign(chatMessage, { isContact: info.isContact }))
          }
        })
      }
    }
  }

  // 更新生活圈消息数
  @SubscribeMessage('updateLifeMessageCount')
  async onUpdateLifeMessageCount(@MessageBody() id: UpdateLifeMessageCountId) {
    // 对方在线，就通知对方更新生活圈消息数
    const client = Object.values(this.clients).find((client) => client.userId === id.userId)
    if (client) {
      client.socket.emit('updateLifeMessageCount')
    }
  }

  // 更新朋友圈消息数
  @SubscribeMessage('updatePyqMessageCount')
  async onUpdatePyqMessageCount(@MessageBody() id: UpdatePyqMessageCountId) {
    // 对方在线，就通知对方更新生活圈消息数
    const client = Object.values(this.clients).find((client) => client.userId === id.userId)
    if (client) {
      client.socket.emit('updatePyqMessageCount')
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
