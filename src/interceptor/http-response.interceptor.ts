import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common'
import { map, Observable } from 'rxjs'
import { Request, Response } from 'express'

// 响应拦截，统一数据格式
@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const host = context.switchToHttp()
    const req = host.getRequest<Request>()
    const res = host.getResponse<Response>()

    if (res.statusCode === 201 && req.method === 'POST') {
      res.statusCode = HttpStatus.OK
    }

    return next.handle().pipe(
      map((data) => ({
        status: res.statusCode,
        statusText: 'OK',
        data: {
          code: 200,
          message: '请求成功',
          data,
        },
      })),
    )
  }
}
