import { Field, InputType } from "@nestjs/graphql";

//InputType 用于定义可以在变更的参数中使用的类型，它是屬於輸入類型
@InputType('CardInput')
export class CardInput {
  @Field({
    description: '名字',
  })
  name: string;

  @Field({
    description: '卡類型 次數：time 時長：duration',
  })
  type: string;

  @Field({
    description: '上課次數',
    nullable: true,
  })
  time: number;

  @Field({
    description: '有效期（天）',
  })
  validityDay: number;
}