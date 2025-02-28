import { CommonType } from '@/common/dto/common.type';
import { CourseType } from '@/modules/course/dto/course.type';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('CardType')
export class CardType {
  @Field({ description: 'id' })
  id: string;

  @Field({ description: '名字' })

  name: string;

  @Field({
    description: `卡類型 
    TIME = "time",
    DURATION = "duration"`,
  })
  type: string;

  @Field({ description: '上課次數' })
  time: number;

  @Field({ description: '有效期 （天）' })
  validityDay: number;

  @Field(() => CourseType, { description: '課程' })
  course: CourseType;
}