import { Field, ObjectType } from '@nestjs/graphql';

//在這裡制定一關於課程時間的type
@ObjectType()
export class OrderTimeType {
  @Field({ description: '開始時間' })
  startTime: string;

  @Field({ description: '结束時間' })
  endTime: string;

  @Field({ description: 'key' })
  key: number;
}

/**
在這裡制定一組可預約的課時間的type，
主要是要提供給資料庫的coruse table entity裡的欄位reducibleTime定義欄位類型
*/
@ObjectType()
export class ReducibleTimeType {
  @Field({ description: '星期幾' })
  week: string;

  /**
  如果該欄位的類型是自定義的，如下所示orderTime的類型是上面的OrderTimeType的物件陣列，
  則需在加入一個參數() => [OrderTimeType] */
  @Field(() => [OrderTimeType], { description: '可預約時間(JSON格式)', })
  orderTime: OrderTimeType[];
}
