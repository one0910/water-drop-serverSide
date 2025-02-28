import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class StudentInput {
  @Field({
    description: '匿稱',
  })
  name: string;

  @Field({
    description: '手機號',
  })
  tel: string;

  @Field({
    description: '頭像',
  })
  avatar: string;
}
