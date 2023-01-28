import { Module } from '@nestjs/common';
import { FriendGroupsController } from './friend-groups.controller';
import { FriendGroupsService } from './friend-groups.service';

@Module({
  controllers: [FriendGroupsController],
  providers: [FriendGroupsService]
})
export class FriendGroupsModule {}
