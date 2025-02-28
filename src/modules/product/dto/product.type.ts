import { OrganizationType } from './../../organization/dto/organization.type';
import { CommonType } from '@/common/dto/common.type';
import { CardType } from '@/modules/card/dto/card.type';
import { Field, ObjectType } from '@nestjs/graphql';

/**
 * 商品
 */
@ObjectType()
export class ProductType extends CommonType {
  @Field({
    description: '名稱',
  })
  name: string;

  @Field({
    description: '描述',
    nullable: true,
  })
  desc: string;

  @Field({
    description: '狀態',
  })
  status: string;

  @Field({
    description: '距離',
  })
  distance?: string;

  @Field({
    description: '分類',
    nullable: true,
  })
  type: string;

  @Field({
    description: '庫存總數',
  })
  stock: number;

  @Field({
    description: '當前庫存',
  })
  curStock: number;

  @Field({
    description: '賣出去多少',
  })
  buyNumber: number;

  @Field({
    description: '每人限購數量',
  })
  limitBuyNumber: number;

  @Field({
    description: '封面圖',
  })
  coverUrl: string;

  @Field({
    description: '頭部banner圖',
  })
  bannerUrl: string;

  @Field({
    description: '原價',
  })
  originalPrice: number;

  @Field({
    description: '優惠價',
  })
  preferentialPrice: number;

  @Field(() => OrganizationType, {
    description: '門店信息',
  })
  org: OrganizationType;

  @Field(() => [CardType], {
    description: '消費卡',
    nullable: true,
  })
  cards?: CardType[];
}
