import { Field, InputType, PartialType } from '@nestjs/graphql';
import { ReducibleTimeInput } from './common.input';

@InputType()
export class CourseInput {
  @Field({
    description: '課程名称',
  })
  name: string;

  @Field({
    description: '課程描述',
    nullable: true,
  })
  desc: string;

  @Field({
    description: '適齡人群',
  })
  group: string;

  @Field({
    description: '適齡基础',
  })
  baseAbility: string;

  @Field({
    description: '封面圖',
    nullable: true,
  })
  coverUrl: string;

  @Field({
    description: '限制上課人数',
  })
  limitNumber: number;

  @Field({
    description: '持續時间',
  })
  duration: number;

  @Field({
    description: '預约信息',
    nullable: true,
  })
  reserveInfo: string;

  @Field({
    description: '退款信息',
    nullable: true,
  })
  refundInfo: string;

  @Field({
    description: '其他說明信息',
    nullable: true,
  })
  otherInfo: string;

  @Field(() => [ReducibleTimeInput], {
    description: '可約時間',
    nullable: true,
  })
  reducibleTime: ReducibleTimeInput[];

  @Field(() => [String], {
    description: '任課老師',
    nullable: true,
  })
  teachers: string[];
}

@InputType()
//PartialType 可以將上面所有的欄位變成可選(?)狀態
export class PartialCourseInput extends PartialType(CourseInput) { }