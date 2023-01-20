import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class FileExist {
  @IsNotEmpty()
  @IsString()
  fileHash: string
}

export class FileInfo {
  @IsNotEmpty()
  @IsString()
  fileHash: string

  @IsNotEmpty()
  @IsString()
  fileIndex: string

  @IsNotEmpty()
  @IsString()
  total: string

  @IsNotEmpty()
  @IsString()
  mimetype: string

  @IsNotEmpty()
  @IsString()
  size: string

  @IsNotEmpty()
  @IsString()
  suffix: string
}

export class FileMergeInfo {
  @IsNotEmpty()
  @IsString()
  fileHash: string

  @IsNotEmpty()
  @IsString()
  model: string
}
