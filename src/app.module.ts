import { CardModule } from './modules/card/card.module';
import { CourseModule } from './modules/course/course.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ScheduleRecordModule } from './modules/schedule-record/schedule-record.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { WxorderModule } from './modules/wxorder/wxorder.module';
import { OrderModule } from './modules/order/order.module';
import { StudentModule } from './modules/student/student.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { ProductModule } from './modules/product/product.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { OSSModule } from './modules/oss/oss.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { WxpayModule } from './modules/wxpay/wxpay.module';
import { CardRecordModule } from './modules/cardRecord/card-record.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [`${__dirname}/../modules/**/*.entity{.ts,.js}`],
      logging: false, //開啟日誌功能，所有的sql操作都會有日誌打印出來
      synchronize: true, //自動同步資料表結構。
      autoLoadEntities: true, //自動載入所設計的entity的table, 也就是當entity沒有在資料庫裡,它會自動建立一個
    }),

    //註冊GraphQL，讓Nestjs具有GraphQL的能力
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: './schema.gql' //設定true會把schema放到記憶體裡，所以它可以更改存放的位置，不一定要放在記憶體
    }),
    UserModule,
    OSSModule,
    AuthModule,
    StudentModule,
    OrganizationModule,
    CourseModule,
    CardModule,
    ProductModule,
    TeacherModule,
    WxpayModule,
    OrderModule,
    WxorderModule,
    CardRecordModule,
    ScheduleModule,
    ScheduleRecordModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
