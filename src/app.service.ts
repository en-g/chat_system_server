import { Injectable } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'

@Injectable()
export class AppService {
  constructor(private sequelize: Sequelize) {}
  async getHello() {
    const friendGroupSelect = `SELECT * FROM userInfo WHERE user_id = 1`
    const result = await this.sequelize.query(friendGroupSelect, {
      type: QueryTypes.SELECT,
    })
    return result
  }
}
