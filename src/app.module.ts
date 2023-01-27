import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { LoginModule } from './login/login.module'
import { UploadModule } from './upload/upload.module'
import { EmailModule } from './email/email.module'
import { FileModule } from './file/file.module'
import { FriendsModule } from './friends/friends.module';
import { GroupsModule } from './groups/groups.module';

// 通用环境变量
const envFilePath = ['.env']
if (process.env.NODE_ENV === 'development') {
  // 开发环境变量
  envFilePath.unshift('.env.dev')
} else {
  // 生产环境变量
  envFilePath.unshift('.env.prod')
}

@Module({
  imports: [
    // 导入 env 环境变量
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    // 连接数据库
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    }),
    AuthModule,
    UsersModule,
    LoginModule,
    UploadModule,
    EmailModule,
    FileModule,
    FriendsModule,
    GroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
