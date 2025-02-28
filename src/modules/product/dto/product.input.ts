import { Field, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class ProductInput {
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
    nullable: true,
  })
  status: string;

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

  @Field(() => [String], {
    description: '消費卡',
  })
  cards: string[];
}

@InputType()
export class PartialProductInput extends PartialType(ProductInput) { }
