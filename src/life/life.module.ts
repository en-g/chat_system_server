import { Module } from '@nestjs/common'
import { LifeController } from './life.controller'
import { LifeService } from './life.service'

@Module({
  controllers: [LifeController],
  providers: [LifeService],
})
export class LifeModule {}
