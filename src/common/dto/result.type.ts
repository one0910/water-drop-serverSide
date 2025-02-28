import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ClassType } from 'type-graphql';
import { Page } from './page.type';
//返回的數據為物件型式(單筆資料)
export interface IResult<T> {
  code: number;
  message: string;
  data?: T;
}

//返回的數據為陣列型式(多筆資料)
export interface IResults<T> {
  code: number
  message: string
  data?: T[]
  page?: Page
}

//單筆資料，回傳成功的訊息的type
export function createResult<T extends object>(ItemType: ClassType<T>): ClassType<IResult<T>> {
  @ObjectType()
  class Result implements IResult<T> {
    @Field(() => Int)
    code: number
    @Field(() => String)
    message: string
    @Field(() => ItemType, { nullable: true })
    data?: T;
  }
  return Result;
}

//多筆資料，成功的回傳訊息的type
export function createResults<T extends object>(ItemType: ClassType<T>): ClassType<IResults<T>> {
  @ObjectType()
  class Results implements IResults<T> {
    @Field(() => Int)
    code: number
    @Field(() => String)
    message: string
    @Field(() => [ItemType], { nullable: true })
    data?: T[]; //泛型的用法，就是上面的T傳入什麼類型，這裡的T就是什麼類型
    @Field(() => Page, { nullable: true })
    page?: Page;
  }
  return Results;
}

//簡訊發送成功的回傳訊息的type
@ObjectType()
export class Result {
  @Field(() => Int)
  code: number
  @Field(() => String)
  message: string
  @Field(() => String, { nullable: true })
  returnCode?: string
  @Field(() => String, { nullable: true })
  data?: string
}