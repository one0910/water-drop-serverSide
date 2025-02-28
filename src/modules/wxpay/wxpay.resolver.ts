import { WxConfig } from './dto/wx-config.type';
import { StudentService } from './../student/student.service';
import { CurUserId } from "@/common/decorators/current-user.decorator";
import { GqlAuthGuard } from "@/common/guards/auth.guards";
import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { WxConfigResult } from './dto/result-wxpay.output';
import { NOT_OPENID, ORDER_LIMIT, PRODUCT_NOT_EXIST, STACK_NOT_ENOUGH, SUCCESS } from '@/common/constants/code';
import { ProductService } from '../product/product.service';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '@/common/constants/enmu';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import config from '@/shared/utils/config';
import { Result } from '@/common/dto/result.type';
import { CardRecordService } from '../cardRecord/card-record.service';

@Resolver()
@UseGuards(GqlAuthGuard)
export class WxpayResolver {
  constructor(
    private readonly cardRecordService: CardRecordService,
    private readonly studentService: StudentService,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) { }

  @Mutation(() => WxConfigResult)
  /*這裡做一個取得微信配置訊息的接口，但實際上沒有接上微信，目前我台灣個人用戶無法申請公眾號
  所以這裡先做一模擬的資料，所回傳的微信配置是課程提供的*/
  async getWxpayConfig(
    @CurUserId() userId,
    @Args('productId') productId: string,
    @Args('quantity') quantity: number, // 数量
    @Args('amount') amount: number, // 以分为單位
  ): Promise<WxConfigResult> {
    const student = await this.studentService.findById(userId)
    const product = await this.productService.findById(productId);
    //該會員(學員)已在該品項的購買記錄
    const orders = await this.orderService.findByStudentAndProduct(
      userId,
      productId,
      product.org.id,
    );
    //若找不到商品資料
    if (!product) {
      return {
        code: PRODUCT_NOT_EXIST,
        message: '没有找對應的商品',
      };
    }
    //若找不到會員(學員)資料或是該會員(學員)沒有微信的openid
    if (!student || !student.openid) {
      return {
        code: NOT_OPENID,
        message: '没有找到該用戶的OPENID',
      };
    }

    //確認該會員(學員)要購買的該品項是否已經超過所設置的購買記錄
    if (orders.length + quantity > product.limitBuyNumber) {
      return {
        code: ORDER_LIMIT,
        message: `一個用戶只能購買${product.name + product.limitBuyNumber} 次課程，您已超過限購數量。`,
      };
    }

    // 若庫存不足時
    if (product.curStock - quantity < 0) {
      return {
        code: STACK_NOT_ENOUGH,
        message: '庫存不足',
      };
    }

    //若找不到會員(學員)資料或是該會員(學員)沒有微信的openid
    if (!student || !student.openid) {
      return {
        code: NOT_OPENID,
        message: '没有找到該用戶的OPENID',
      };
    }

    //使用uuid的套件產生orderId(微信支付訂單號)
    const outTradeNo = uuidv4().replace(/-/g, '');
    const transaction_id = `wx_transaction_id_${Math.floor(Math.random() * 100000)}`;

    //建立正在支付中的訂單
    await this.orderService.create({
      tel: student.tel,
      quantity,
      amount,
      outTradeNo,
      product: { id: productId },
      org: { id: product.org.id },
      student: { id: userId },
      status: OrderStatus.USERPAYING,
    });

    //這裡模擬一個將建立好的訂單送回Controller層做微信支付的資料保存
    await axios.post(`${config.HOST}/wx/wxpayResult`, {
      outTradeNo,
      transaction_id,
      openid: student.openid
    });


    const result = {
      appId: 'wx2421b1c4370ec43b',
      timeStamp: Math.floor(Date.now() / 1000),
      nonceStr: 'e61463f8efa94090b1f366cccfbbb444',
      package: 'prepay_id=u802345jgfjsdfgsdg888',
      signType: 'MD5',
      paySign: '70EA570631E4BB79628FBCA90534C63FF7FADD89'
    }

    //下面回傳的是模擬的微信配置資料，並非真實的資料
    return {
      code: SUCCESS,
      data: result as WxConfig,
      message: '獲取微信配置訊息',
    };
  }

  /*課程所提供的微信模擬API*/
  @Mutation(() => Result)
  async mockOrderGenerator(
    @CurUserId() userId: string,
    @Args('productId') productId: string,
    @Args('quantity') quantity: number, // 数量
    @Args('amount') amount: number, // 以分为单位
  ): Promise<Result> {
    const student = await this.studentService.findById(userId);
    const product = await this.productService.findById(productId);
    const orders = await this.orderService.findByStudentAndProduct(userId, productId, product.org.id);
    //確認該會員(學員)要購買的該品項是否已經超過所設置的購買記錄
    if (orders.length + quantity > product.limitBuyNumber) {
      return {
        code: ORDER_LIMIT,
        message: `一個用戶只能購買${product.name + product.limitBuyNumber} 次課程，您已超過限購數量。`,
      };
    }

    // 若庫存不足時
    if (product.curStock - quantity < 0) {
      return {
        code: STACK_NOT_ENOUGH,
        message: '庫存不足',
      };
    }

    //使用uuid的套件產生orderId(微信支付訂單號)
    const outTradeNo = uuidv4().replace(/-/g, '');

    //直接寫入訂單
    await this.orderService.create({
      tel: student.tel,
      outTradeNo,
      quantity,
      amount,
      product: { id: productId },
      org: { id: product.org.id },
      student: { id: userId },
      status: OrderStatus.SUCCESS,
      wxOrder: {
        mchid: '322323233',
        appid: 'wx3232332323332',
        out_trade_no: outTradeNo,
        transaction_id: 'transaction' + outTradeNo,
        trade_type: 'JSAPI',
        trade_state: 'SUCCESS',
        trade_state_desc: '支付成功',
        bank_type: 'OTHERS',
        attach: '',
        success_time: '2023-05-23T00:48:25+08:00',
        openid: student.openid,
        total: amount,
        payer_total: amount,
        currency: 'CNY',
        payer_currency: 'CNY',
        org: { id: product.org.id },
      },
    });

    /*商品(課程)會綁定消費卡，若有綁定綁費卡，當會員(學員)購買時，
    我們需要另有另外一個table，來記錄將該商品(課程)所被綁定的消費卡的相關關聯資料(cardId、studentId、courseId、orgId)
    所以這裡就需要寫一個程序將它關聯的相關息訊寫入到card_record的table裡*/
    await this.cardRecordService.addCardForStudent(
      userId,
      product.cards.map((item) => item.id),
    );

    // 更新商品(課程)table表裡的已賣數量(buyNumber)及目前庫存(curStock)
    await this.productService.updateById(product.id, {
      buyNumber: product.buyNumber + quantity,
      curStock: product.curStock - quantity,
    });

    return {
      code: SUCCESS,
      message: '購買成功',
    };
  }
}