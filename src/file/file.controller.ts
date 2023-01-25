import { Controller, Get, Param, Res } from '@nestjs/common'
import { createReadStream } from 'fs'
import { resolve } from 'path'
import { Response } from 'express'

@Controller('public')
export class FileController {}
