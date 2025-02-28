import { Field, ObjectType } from '@nestjs/graphql';
import { CardType } from '@/modules/card/dto/card.type';
import { StudentType } from '@/modules/student/dto/student.type';
import { Organization } from '@/modules/organization/models/organization.entity';
import { OrganizationType } from '@/modules/organization/dto/organization.type';
import { CourseType } from '@/modules/course/dto/course.type';

/**
 * 消費卡
 */
@ObjectType()
export class CardRecordType {
  @Field({
    description: 'id',
  })
  id: string;

  @Field({
    description: '開始時間',
    nullable: true,
  })
  startTime: Date;

  @Field({
    description: '結束時間',
    nullable: true,
  })
  endTime: Date;

  @Field({
    description: '購買時間',
    nullable: true,
  })
  buyTime: Date;

  @Field({
    description: '剩餘次數',
    nullable: true,
  })
  residueTime: number;

  @Field({
    description: '狀態',
    nullable: true,
  })
  status?: string;

  @Field(() => CardType, { nullable: true, description: '關聯卡實體' })
  card: CardType;

  @Field(() => CourseType, { nullable: true, description: '課程' })
  course: CourseType;

  @Field(() => StudentType, { nullable: true, description: '學員' })
  student: StudentType;

  @Field(() => OrganizationType, { nullable: true, description: '門市' })
  org: Organization;
}