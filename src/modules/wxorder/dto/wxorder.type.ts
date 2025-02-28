import { CommonType } from '@/common/dto/common.type';
import { OrganizationType } from '@/modules/organization/dto/organization.type';
import { Field, ObjectType } from '@nestjs/graphql';

/**
 * 微信支付訂單訊息
 */
@ObjectType()
export class WxorderType extends CommonType {
  @Field({
    description: '微信公眾號ID',
  })
  appid: string;

  @Field({
    description: '商戶號',
  })
  mchid: string;

  @Field({
    description: 'openid',
    nullable: true,
  })
  openid: string;

  @Field({
    description: '交易類型',
    nullable: true,
  })
  trade_type: string;

  @Field({
    description: '交易狀態',
    nullable: true,
  })
  trade_state: string;

  @Field({
    description: '銀行',
    nullable: true,
  })
  bank_type: string;

  @Field({
    description: '微信支付訂單號',
    nullable: true,
  })
  transaction_id: string;

  @Field({
    description: '商戶訂單號',
    nullable: true,
  })
  out_trade_no: string;

  @Field({
    description: '附加数數',
    nullable: true,
  })
  attach: string;

  @Field({
    description: '交易狀態描述',
    nullable: true,
  })
  trade_state_desc: string;

  @Field({
    description: '支付完成時間',
    nullable: true,
  })
  success_time: string;

  @Field({
    description: '訂單總金額，單位為分',
    nullable: true,
  })
  total: number;

  @Field({
    description: '用户支付金額，單位為分',
    nullable: true,
  })
  payer_total: number;

  @Field({
    description: 'CNY：人民幣，中國境内商户號僅支持人民幣',
    nullable: true,
  })
  currency: string;

  @Field({
    description: '用户支付幣種，示例值：CNY',
    nullable: true,
  })
  payer_currency: string;

  @Field(() => OrganizationType, { nullable: true, description: '门店' })
  org?: OrganizationType;
}
