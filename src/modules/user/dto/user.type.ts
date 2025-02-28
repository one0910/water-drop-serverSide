import { CommonType } from '@/common/dto/common.type';
import { Field, ObjectType } from '@nestjs/graphql';

// ObjectType 用于定义可以在查询和变更的返回类型中使用的类型，是屬於输出类型
@ObjectType()
export class UserType extends CommonType {
  @Field({ description: '匿稱' })
  name?: string;
  @Field({ description: '簡介' })
  desc?: string;
  @Field({ description: '聯絡電話' })
  tel?: string;
  @Field({ description: '用戶資料' })
  account?: string;
  @Field({ description: '個人頭像', nullable: true })
  avatar?: string;
}