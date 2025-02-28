import { CardRecordModule } from './../cardRecord/card-record.module';
import { Module } from "@nestjs/common";
import { WxpayController } from "./wxpay.controller";
import { OrderModule } from './../order/order.module';
import { StudentModule } from "../student/student.module";
import { ProductModule } from "../product/product.module";
import { WxpayResolver } from "./wxpay.resolver";
import { WxorderModule } from "../wxorder/wxorder.module";

@Module({
  controllers: [WxpayController],
  providers: [WxpayResolver],
  imports: [
    StudentModule,
    ProductModule,
    OrderModule,
    WxorderModule,
    CardRecordModule,
  ],
})

export class WxpayModule { }