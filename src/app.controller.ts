import { Controller, Get, HttpException, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AppService } from './app.service'

@Controller()
// @UseGuards(AuthGuard('jwt'))
export class AppController {
  // constructor(private readonly appService: AppService) {}
  // @Get()
  // async getHello() {
  //   return await this.appService.getHello()
  // }
}
