import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { CommonEntity } from '@/common/entities/common.entities';
import { Organization } from '@/modules/organization/models/organization.entity';
import { Order } from '@/modules/order/models/order.entity';

/**
 * 微信订单信息
 */
@Entity('wxorder')
export class Wxorder extends CommonEntity {
  @Column({
    comment: '微信公眾號ID',
  })
  appid: string;

  @Column({
    comment: '商戶號',
  })
  mchid: string;

  @Column({
    comment: 'openid',
    nullable: true,
  })
  openid: string;

  @Column({
    comment: '交易類',
    nullable: true,
  })
  trade_type: string;

  @Column({
    comment: '交易狀態',
    nullable: true,
  })
  trade_state: string;

  @Column({
    comment: '银行',
    nullable: true,
  })
  bank_type: string;

  @Column({
    comment: '微信支付訂單號',
    nullable: true,
  })
  transaction_id: string;

  @Column({
    comment: '商户訂單號',
    nullable: true,
  })
  out_trade_no: string;

  @Column({
    comment: '附加数据',
    nullable: true,
  })
  attach: string;

  @Column({
    comment: '交易狀況描述',
    nullable: true,
  })
  trade_state_desc: string;

  @Column({
    comment: '支付完成時間',
    nullable: true,
  })
  success_time: string;

  @Column({
    comment: '訂單總金額，單位為分',
    nullable: true,
  })
  total: number;

  @Column({
    comment: '用户支付金額，單位為分',
    nullable: true,
  })
  payer_total: number;

  @Column({
    comment: 'CNY：人民幣，中國境内商户號僅支持人民幣',
    nullable: true,
  })
  currency: string;

  @Column({
    comment: '用户支付幣種，示例值：CNY',
    nullable: true,
  })
  payer_currency: string;

  //一個門店會有多個訂單
  @ManyToOne(() => Organization, { cascade: true })
  org?: Organization;

  //一個訂單只會對應一個微信支付訂單號
  @OneToOne(() => Order, (order) => order.wxOrder)
  @JoinColumn()  // <-- 這行會讓 TypeORM 在 `wxorder` 表內建立 `orderId` 欄位
  order?: Order;
}
