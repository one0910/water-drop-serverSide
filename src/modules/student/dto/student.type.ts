import { CommonType } from '@/common/dto/common.type';
import { Field, ObjectType } from '@nestjs/graphql';

/**
 * 學員
 */
@ObjectType()
export class StudentType extends CommonType {
  @Field({
    description: '匿稱',
    nullable: true,
  })
  name: string;

  @Field({
    description: '手機號',
    nullable: true,
  })
  tel: string;

  @Field({
    description: '頭像',
    nullable: true,
  })
  avatar: string;

  @Field({
    description: '帳號',
    nullable: true,
  })
  account: string;

  @Field({
    description: 'openid',
    nullable: true,
  })
  openid?: string;
}