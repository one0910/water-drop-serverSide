import { CommonType } from '@/common/dto/common.type';
import { OrganizationType } from '@/modules/organization/dto/organization.type';
import { ProductType } from '@/modules/product/dto/product.type';
import { StudentType } from '@/modules/student/dto/student.type';
import { WxorderType } from '@/modules/wxorder/dto/wxorder.type';
import { Field, ObjectType } from '@nestjs/graphql';

/**
 * 訂單
 */
@ObjectType()
export class OrderType extends CommonType {
  @Field({ nullable: true })
  id: string;

  @Field({
    description: '數量',
  })
  quantity: number;

  @Field({
    description: 'amount',
  })
  amount: number;

  @Field({
    description: '手機號碼',
  })
  tel: string;

  @Field({
    description: '狀態',
  })
  status: string;

  @Field({
    description: 'createdAt',
    nullable: true,
  })
  createdAt: Date;

  @Field({
    description: '訂單號',
    nullable: true,
  })
  outTradeNo: string;

  @Field(() => StudentType, { nullable: true, description: '購買學員' })
  student: StudentType;

  @Field(() => OrganizationType, { nullable: true, description: '門店(機構)' })
  org: OrganizationType;

  @Field(() => ProductType, { nullable: true, description: '商品' })
  product: ProductType;

  @Field(() => WxorderType, { nullable: true, description: '微信訂單訊息' })
  wxOrder?: WxorderType;
}
