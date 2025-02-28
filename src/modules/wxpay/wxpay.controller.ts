import { CardRecordService } from './../cardRecord/card-record.service';
import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { StudentService } from "../student/student.service";
import { IWxpayResult } from "./dto/wxpay-result.type";
import { OrderStatus } from "@/common/constants/enmu";
import { OrderService } from "../order/order.service";
import { WxorderService } from "../wxorder/wxorder.service";
import { WxorderType } from "../wxorder/dto/wxorder.type";
import { v4 as uuidv4 } from 'uuid';
import { ProductService } from '../product/product.service';

/**
 * 微信支付登入相關
  使用微信支付需要申請公眾號，由於台灣個人用戶只能用在大陸有政府許可經營的企業才能申請
  所以這裡所做的微信登入相關都只是寫一個模擬程序而已，並非真的使用微信的API的做架接
  這裡的模糊主要目的是要做controller層的練習、頁面的轉跳、資料的傳送
 * 
 */
@Controller('wx')
export class WxpayController {
  constructor(
    private readonly studentService: StudentService,
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    private readonly cardRecordService: CardRecordService,
    private readonly wxorderService: WxorderService,
  ) { }

  /**
    @param data
    @returns
  */
  @Post('wxpayResult')
  async wxpayResult(@Body() data: any) {
    const { outTradeNo, openid, transaction_id } = data
    //模擬支付成功
    const result: WxorderType = {
      trade_state: 'SUCCESS',
      out_trade_no: outTradeNo,
      transaction_id,
      openid,
      appid: "",
      mchid: "",
      trade_type: "",
      bank_type: "",
      attach: "",
      trade_state_desc: "",
      success_time: "",
      total: 0,
      payer_total: 0,
      currency: "",
      payer_currency: "",
      id: uuidv4().replace(/-/g, ''),
      createdAt: undefined,
      createdBy: "",
      updatedAt: undefined,
      updatedBy: "",
      deletedAt: undefined,
      deletedBy: ""
    }

    const order = await this.orderService.findByOutTradeNo(result.out_trade_no);

    //由於模擬第三方的支付，所以這裡可以設想一個情境是當支持狀態還在支付中時，我們再繼續往下做
    if (order && order.status === OrderStatus.USERPAYING) {
      let wxOrder = await this.wxorderService.findByTransactionId(result.transaction_id)
      if (!wxOrder) {
        wxOrder = await this.wxorderService.create(result)
      }

      //建立好微信訂單後，再將更新的order的訂單
      if (wxOrder) {
        const product = await this.productService.findById(order.product.id);
        const res = await this.cardRecordService.addCardForStudent(order.student.id, product.cards.map((item) => item.id));

        if (res) {
          await this.orderService.updateById(order.id, {
            status: result.trade_state,
            /*要關聯的微信支付訊息，這裡雖然是針對oreder做update，
            但實際上是將對應的orderId儲存至wxOrder table的orderId欄位裡*/
            wxOrder: wxOrder
          })
        }
      }
    }

    //若微信支付回傳的是成功訊息
    if (result.trade_state === OrderStatus.SUCCESS) {

      // this.orderService.updateById()
    }
    return {
      code: 'SUCCESS',
      message: '成功',
    };
  }

  // /wx/wxCode路由 - 微信登入模擬(主要取得微信code並再送回至/wx/wxCode路由)
  @Get('login')
  async wxLogin(
    @Query('userId') userId: string,
    @Query('url') url: string,
    @Res() res,
  ): Promise<void> {
    //轉跳至/wx/wxCode的路由，並再將放資料放入state中並傳送至/wx/wxCode
    res.redirect(`/wx/wxCode?state=${userId}@${encodeURIComponent(url)}`)
  }

  // /wx/wxCode路由 - 得到微信code，後後用code直接去获取 openid並將其openid送回前端
  @Get('wxCode')
  async wxCode(
    @Query('state') state: string,
    @Res() res,
  ) {
    //到收從/wx/login送來的資料，並用split拆分後，取得userId及url
    const [userId, url] = state.split('@');

    //這裡是模擬取得openid後,並將openid寫入到studentService的資料庫
    await this.studentService.updateById(userId, {
      openid: `wx_open_id_${Math.floor(Math.random() * 100000)}`,
    });
    res.redirect(decodeURIComponent(url));
  }


}

