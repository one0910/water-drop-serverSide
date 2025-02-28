import { Module, ConsoleLogger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wxorder } from './models/wxorder.entity';
import { WxorderService } from './wxorder.service';
import { WxorderResolver } from './wxorder.resolver';
import { Order } from '../order/models/order.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Wxorder])
  ],
  providers: [WxorderService, WxorderResolver],
  exports: [WxorderService]
})

export class WxorderModule { }
