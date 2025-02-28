import { CommonType } from '@/common/dto/common.type';
import { CourseType } from '@/modules/course/dto/course.type';
import { OrganizationType } from '@/modules/organization/dto/organization.type';
import { ScheduleRecordType } from '@/modules/schedule-record/dto/schedule-record.type';
import { TeacherType } from '@/modules/teacher/dto/teacher.type';
import { Field, ObjectType } from '@nestjs/graphql';

/**
 * 课程表
 */
@ObjectType()
export class ScheduleType extends CommonType {
  @Field({
    description: 'id',
  })
  id: string;

  @Field({
    description: '上課日期',
    nullable: true,
  })
  schoolDay: Date;

  @Field({
    description: '開始時间',
    nullable: true,
  })
  startTime: string;

  @Field({
    description: '结束時間',
    nullable: true,
  })
  endTime: string;

  @Field({
    description: '人數限制',
    nullable: true,
  })
  limitNumber: number;

  @Field(() => CourseType, { nullable: true, description: '課程實體信息' })
  course: CourseType;

  @Field(() => OrganizationType, { nullable: true, description: '機構信息' })
  org: OrganizationType;

  @Field(() => TeacherType, { nullable: true, description: '老師' })
  teacher?: TeacherType;

  @Field(() => [ScheduleRecordType], {
    nullable: true,
    description: '預約記錄',
  })
  scheduleRecords?: ScheduleRecordType[];

}
