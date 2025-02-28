import { CommonType } from '@/common/dto/common.type';
import { Field, ObjectType } from '@nestjs/graphql';

/**
 * 学员
 */
@ObjectType()
export class TeacherType extends CommonType {
  @Field({
    description: '名稱',
  })
  name: string;

  @Field({
    description: '照片',
    nullable: true,
  })
  photoUrl: string;

  @Field({
    description: '教齡',
    nullable: true,
  })
  teacherTime: number;

  @Field({
    description: '風格標籤，以，隔开',
    nullable: true,
  })
  tags: string;

  @Field({
    description: '學歷',
    nullable: true,
  })
  education: string;

  @Field({
    description: '資歷',
    nullable: true,
  })
  seniority: string;

  @Field({
    description: '職業經驗',
    nullable: true,
  })
  experience: string;

  @Field({
    description: '獲獎經歷',
    nullable: true,
  })
  carryPrize: string;
}
