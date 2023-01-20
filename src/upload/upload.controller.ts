import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileExist, FileInfo, FileMergeInfo } from './dto/upload.dto'
import { UploadService } from './upload.service'

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // 查询文件是否存在
  @Get('search/:fileHash')
  async searchFileExist(@Param() fileHash: FileExist) {
    return await this.uploadService.searchFileExist(fileHash)
  }

  // 上传文件分块
  @UseInterceptors(FileInterceptor('file'))
  @Post('file')
  async uploadFile(@Body() body: FileInfo, @UploadedFile() file: Express.Multer.File) {
    console.log(file)
    return await this.uploadService.uploadFile({
      ...body,
      fileName: file.filename,
    })
  }

  // 合并文件
  @Post('merge')
  async uploadFileMerge(@Body() info: FileMergeInfo) {
    return await this.uploadService.uploadFileMerge(info)
  }
}
