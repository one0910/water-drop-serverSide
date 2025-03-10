import { Field, InputType } from "@nestjs/graphql";

//InputType 用于定义可以在变更的参数中使用的类型，它是屬於輸入類型
@InputType()
export class UserInput {
  @Field({ description: '匿稱' })
  name: string
  @Field({ description: '簡介' })
  desc: string
  @Field({ description: '個人頭像', nullable: true })
  avatar?: string
}