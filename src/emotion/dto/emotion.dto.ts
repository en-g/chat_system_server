import { IsNotEmpty, IsNumber, IsNumberString } from 'class-validator'

export class EmotionList {
  @IsNotEmpty()
  @IsNumberString()
  userId: string
}

export class UploadEmotion {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsNumber()
  fileId: number
}
