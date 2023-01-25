import { Controller, Get, Param, Res } from '@nestjs/common'
import { createReadStream } from 'fs'
import { resolve } from 'path'
import { Response } from 'express'

@Controller('public')
export class FileController {
  // 获取图片
  @Get('*')
  getFile(@Param() url: string, @Res() res: Response) {
    const file = createReadStream(resolve(process.cwd(), `public/${url['0']}`))
    file.pipe(res)
  }
}
