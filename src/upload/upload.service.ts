import { Injectable } from '@nestjs/common'
import { createReadStream, createWriteStream, unlink } from 'fs'
import { resolve } from 'path'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { FileExist, FileInfo, FileMergeInfo } from './interface/upload.interface'

@Injectable()
export class UploadService {
  constructor(private sequelize: Sequelize) {}

  async searchFileExist(info: FileExist) {
    const actualFileSelect = `SELECT id, mimetype, size, fileHash, url FROM files WHERE fileHash = :fileHash`
    const temporaryFileSelect = `SELECT fileIndex FROM temporaryFile WHERE fileHash = :fileHash`
    const actualFileSelectRes = await this.sequelize.query(actualFileSelect, {
      replacements: { ...info },
      type: QueryTypes.SELECT,
    })
    // 文件存在，直接返回文件信息
    if (actualFileSelectRes.length > 0) {
      return {
        status: 1,
        fileInfo: actualFileSelectRes[0],
      }
    }
    const temporaryFileSelectRes = await this.sequelize.query(temporaryFileSelect, {
      replacements: { ...info },
      type: QueryTypes.SELECT,
    })
    // 部分文件存在，返回所有已经上传的 chunk 序号
    if (temporaryFileSelectRes.length > 0) {
      return {
        status: 2,
        temporaryList: temporaryFileSelectRes,
      }
    }
    // 文件不存在
    return {
      status: 0,
    }
  }

  async uploadFile(info: FileInfo) {
    const temporaryFileInsert = `INSERT INTO temporaryFile (fileHash, fileName, fileIndex, total, mimetype, size, suffix) VALUES (:fileHash, :fileName, :fileIndex, :total, :mimetype, :size, :suffix)`
    const temporaryFileInsertRes = await this.sequelize.query(temporaryFileInsert, {
      replacements: { ...info },
      type: QueryTypes.INSERT,
    })
    return !!temporaryFileInsertRes[1]
  }

  async uploadFileMerge(info: FileMergeInfo) {
    const temporaryFileSelect = `SELECT mimetype, size, suffix, fileName, fileIndex, total, mimetype, size, suffix FROM temporaryFile WHERE fileHash = :fileHash ORDER BY fileIndex ASC`
    const temporaryFileDelete = `DELETE FROM temporaryFile WHERE fileHash = :fileHash`
    const actualFileInsert = `INSERT INTO files (mimetype, size, fileHash, url) VALUES (:mimetype, :size, :fileHash, :url)`
    const result = await this.sequelize.transaction(async (t) => {
      const temporaryFileSelectRes: any[] = await this.sequelize.query(temporaryFileSelect, {
        replacements: { ...info },
        type: QueryTypes.SELECT,
      })
      const filename = `${info.model}/${
        info.fileHash + temporaryFileSelectRes[0].size + temporaryFileSelectRes[0].suffix
      }`
      const url = `${process.env.LOCALHOST}public/${filename}`
      // 临时文件合并
      temporaryFileSelectRes.forEach((temporaryFile) => {
        const readStream = createReadStream(resolve(process.cwd(), `public/temporary/${temporaryFile.fileName}`))
        const writeStream = createWriteStream(resolve(process.cwd(), `public/${filename}`))
        readStream.pipe(writeStream, { end: false })
        readStream.on('end', function () {
          readStream.close()
        })
      })
      await this.sequelize.query(temporaryFileDelete, {
        replacements: { ...info },
        type: QueryTypes.DELETE,
        transaction: t,
      })
      const actualFileInsertRes = await this.sequelize.query(actualFileInsert, {
        replacements: {
          mimetype: temporaryFileSelectRes[0].mimetype,
          size: temporaryFileSelectRes[0].size,
          url,
          fileHash: info.fileHash,
        },
        type: QueryTypes.INSERT,
        transaction: t,
      })
      // 删除临时文件
      temporaryFileSelectRes.forEach((temporaryFile) => {
        unlink(resolve(process.cwd(), `public/temporary/${temporaryFile.fileName}`), (err) => {
          if (!err) {
            console.log('delete temporary file success')
          }
        })
      })
      return {
        id: actualFileInsertRes[0],
        mimetype: temporaryFileSelectRes[0].mimetype,
        size: temporaryFileSelectRes[0].size,
        fileHash: info.fileHash,
        url,
      }
    })
    return result
  }
}
