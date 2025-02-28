import { Module, ConsoleLogger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { UserServices } from './user.services';
import { UserResolver } from './user.resolver';


@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  providers: [ConsoleLogger, UserServices, UserResolver],
  exports: [UserServices] //這裡的export目的是要讓其他地方可以使用此UserServices，所以必須得加
})

export class UserModule { }
