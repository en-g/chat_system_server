import { Module } from '@nestjs/common';
import { PyqController } from './pyq.controller';
import { PyqService } from './pyq.service';

@Module({
  controllers: [PyqController],
  providers: [PyqService]
})
export class PyqModule {}
