import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { User } from './interface/auth.interface'

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async validateUser(info: User): Promise<any> {
    const user: any = await this.usersService.searchUser(info)
    if (user) {
      return user
    }
    return null
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
    }
  }
}
