import { Student } from '@/modules/student/models/student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, ConsoleLogger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.services';
import { AuthResolver } from './auth.resolver';
import { UserServices } from '../user/user.services';
import { User } from './../user/models/user.entity';
import { JwtStrategy } from './jwt.strategy';
import { StudentService } from '../student/student.service';
//這裡的執行順序會快於main.js，所以這裡如果要使用process.env.JWT_SECRET，可以在這裡將dotenv的config先導入，不然這裡會抓不到process.env.JWT_SECRET
import { config } from 'dotenv';
import { getEnvConfig } from '../../shared/utils/config';
config({ path: getEnvConfig() });

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: `${60 * 60 * 24 * 7}s` //過期時間設置為7日
      }
    })
  ],
  /**
  *1.由於auth.module.ts這個檔案是身份驗證（Authentication）的模組, 可以搭配JwtStrategy來一起使用
  例如可以從前端來的request header中提取Authorization裡的Bearer Token，來驗證其token是否過期
  *2.通常JwtStrategy與會UseGuards一起搭配使用
  */
  providers: [
    JwtStrategy,
    ConsoleLogger,
    AuthService,
    AuthResolver,
    UserServices,
    StudentService
  ],
  exports: []
})
export class AuthModule { }

