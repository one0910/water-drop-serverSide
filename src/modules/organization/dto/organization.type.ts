import { CommonType } from '@/common/dto/common.type';
import { CourseType } from '@/modules/course/dto/course.type';
import { OrgImageType } from '@/modules/orgImage/dto/orgImage.output';
import { Field, ObjectType } from '@nestjs/graphql';

// ObjectType 用于定义可以在查询和变更的返回类型中使用的类型，是屬於输出类型
@ObjectType()
export class OrganizationType extends CommonType {
  @Field({
    description: '營業执照',
  })
  businessLicense: string;

  @Field({
    description: '法人身份證正面',
  })
  identityCardFrontImg: string;

  @Field({
    description: '法人身份證反面',
  })
  identityCardBackImg: string;

  @Field({
    description: '標籤以，隔开',
    nullable: true,
  })
  tags: string;

  @Field({
    description: '簡介',
    nullable: true,
  })
  description: string;

  @Field({
    description: '門市名',
    nullable: true,
  })
  name: string;

  @Field({
    description: 'logo',
    nullable: true,
  })
  logo: string;

  @Field({
    description: '經度',
    nullable: true,
  })
  longitude: string;

  @Field({
    description: '緯度',
    nullable: true,
  })
  latitude: string;

  @Field({
    description: '地址',
    nullable: true,
  })
  address?: string;

  @Field({
    description: '電話',
    nullable: true,
  })
  tel: string;

  @Field(() => [OrgImageType], { nullable: true, description: "封面圖" })
  orgFrontImg?: OrgImageType[];

  @Field(() => [OrgImageType], { nullable: true, description: "室內圖" })
  orgRoomImg?: OrgImageType[];

  @Field(() => [OrgImageType], { nullable: true, description: "其他圖" })
  orgOtherImg?: OrgImageType[];

  @Field(() => [CourseType], { nullable: true, description: '門店的課程' })
  courses?: CourseType[];
}