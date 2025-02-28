import { Field, ObjectType } from '@nestjs/graphql';

/**
 * 商品類型
 */
@ObjectType()
export class ProductTypeType {
  @Field({
    description: 'key',
  })
  key: string;

  @Field({
    description: '名稱',
  })
  title: string;
}