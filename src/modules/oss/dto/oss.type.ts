import { Field, Int, ObjectType } from '@nestjs/graphql';

// ObjectType 用于定义可以在查询和变更的返回类型中使用的类型，是屬於输出类型
@ObjectType()
export class OSSType {
  @Field({ description: '過期時間' })
  expire?: string;
  @Field({ description: '策略' })
  policy?: string;
  @Field({ description: '簽名' })
  signature?: string;
  @Field({ description: 'key' })
  accessId?: string;
  @Field({ description: 'host' })
  host?: string;
  @Field({ description: '存放在阿里雲Bucket的資料夾名稱' })
  dir?: string;
}

@ObjectType()
export class OSSType2 {
  @Field(() => Int)
  code: number
  @Field(() => String)
  message: string
}