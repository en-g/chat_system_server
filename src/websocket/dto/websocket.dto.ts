import { IsNumber } from 'class-validator'
import { Socket } from 'net'

export class Clients {
  [key: number]: ClientsItem
}

export class ClientsItem {
  socketId: string
  socket: Socket
  isConnect: boolean
}

export class ClientId {
  @IsNumber()
  userId: number
}
