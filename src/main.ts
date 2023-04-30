import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './filter/all-exceptions.filter'
import { HttpResponseInterceptor } from './interceptor/http-response.interceptor'
import { GeneralValidatePipe } from './pipe/general-validate.pipe'
import { WebsocketGateway } from './websocket/websocket.gateway'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  const websocketGateway = app.get(WebsocketGateway)
  // 初始化群的成员id
  websocketGateway.initGroupMemberIds().then(() => {
    console.log('初始化群的成员id:', websocketGateway.groups)
  })
  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter())
  // 全局验证管道
  app.useGlobalPipes(new GeneralValidatePipe())
  // 全局请求响应拦截器
  app.useGlobalInterceptors(new HttpResponseInterceptor())
  app.listen(3000).then(() => {
    console.log('Server connection succeeded...')
  })
}
bootstrap()
