import { Field, InputType } from '@nestjs/graphql';

@InputType()
class OrderTimeInput {
  @Field({ description: '開始時間' })
  startTime: string;

  @Field({
    description: '结束時間'
  })
  endTime: string;

  @Field({ description: 'key', })
  key: number;
}

@InputType()
export class ReducibleTimeInput {
  @Field({ description: '星期幾' })
  week: string;

  @Field(() => [OrderTimeInput], { description: '可預約時間(JSON格式)' })
  orderTime: OrderTimeInput[];
}
