import { Organization } from '@/modules/organization/models/organization.entity';
import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm"
import { IsNotEmpty, Min } from "class-validator"
import { CommonEntity } from "@/common/entities/common.entities"
import { ProductStatus } from '@/common/constants/enmu';
import { Card } from '@/modules/card/models/card.entity';

@Entity('product')

/**
 * 组件
*/
export class Product extends CommonEntity {
  @Column({
    comment: '暱稱',
    default: ''
  })
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  @Column({
    comment: '簡介',
    default: ''
  })
  desc: string

  @Column({
    comment: '分類',
    nullable: true,
  })
  type: string;

  @Column({
    comment: '商品狀態：上架，下架',
    default: ProductStatus.UN_LIST,
  })
  @IsNotEmpty()
  status: string;


  @Column({
    comment: '庫存總數',
    default: 0,
  })
  stock: number;

  @Column({
    comment: '當前庫存',
    default: 0,
  })
  curStock: number;

  @Column({
    comment: '賣出去多少',
    default: 0,
  })
  buyNumber: number;

  @Column({
    comment: '每人限購數量',
    default: -1,
  })
  limitBuyNumber: number;

  @Column({
    comment: '封面圖',
  })
  coverUrl: string;

  @Column({
    comment: '頭部banner圖',
  })
  bannerUrl: string;

  @Column({
    type: 'float',
    comment: '原價',
  })
  @IsNotEmpty()
  @Min(0.01)
  originalPrice: number;

  @Column({
    type: 'float',
    comment: '優惠價',
  })
  @IsNotEmpty()
  @Min(0.01)
  preferentialPrice: number;

  @ManyToOne(() => Organization, (org) => org.products, {
    cascade: true,
  })
  org: Organization;

  @ManyToMany(() => Card, { cascade: true })
  @JoinTable({ //多對多的關係要另外再加個table
    name: 'product_card',
  })
  cards: Card[];
}