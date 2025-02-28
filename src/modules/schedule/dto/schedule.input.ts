import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ScheduleInput {
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
