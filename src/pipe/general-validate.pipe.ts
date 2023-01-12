import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common'
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'

// 通用的参数验证管道，只能验证 dto 参数
@Injectable()
export class GeneralValidatePipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value
    }
    // 将参数转换为可验证类型的对象
    const object = plainToClass(metatype, value)
    // 参数验证
    const errors = await validate(object)
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed')
    }
    return value
  }

  // 参数非 dto 直接跳过
  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object]
    return !types.includes(metatype)
  }
}
