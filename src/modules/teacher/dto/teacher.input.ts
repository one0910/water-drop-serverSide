import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class TeacherInput {
  @Field({
    description: '名稱',
  })
  name: string;

  @Field({
    description: '照片',
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
