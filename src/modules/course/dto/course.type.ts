import { CommonType } from '@/common/dto/common.type';
import { Field, ObjectType } from '@nestjs/graphql';
import { ReducibleTimeType } from './common.type';
import { TeacherType } from '@/modules/teacher/dto/teacher.type';

/**
 * 課程
 */
@ObjectType()
export class CourseType extends CommonType {
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
    description: '封面圖',
    nullable: true,
  })
  coverUrl: string;

  @Field({
    description: '適合基礎',
  })
  baseAbility: string;

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

  @Field(() => [ReducibleTimeType], {
    description: '可預約時間',
    nullable: true,
  })
  reducibleTime: ReducibleTimeType[];

  @Field(() => [TeacherType], {
    description: '任课老师',
    nullable: true,
  })
  teachers: TeacherType[];
}
