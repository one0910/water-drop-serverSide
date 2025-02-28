import { OrgImageInput } from './../../orgImage/dto/orgImage.input';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class OrganizationInput {
  @Field({
    description: '名稱',
  })
  name: string;

  @Field({
    description: 'logo',
  })
  logo: string;

  @Field({
    description: '手機號',
    nullable: true,
  })
  tel: string;

  @Field({
    description: 'tags',
    nullable: true,
  })
  tags: string;

  @Field({
    description: 'longitude',
    nullable: true,
  })
  longitude: string;

  @Field({
    description: 'latitude',
    nullable: true,
  })
  latitude: string;

  @Field({
    description: 'latitude',
    nullable: true,
  })
  address: string;

  @Field({
    description: '營業執照',
  })
  businessLicense: string;

  @Field({
    description: 'description',
  })
  description: string;

  @Field({
    description: '法人身份證',
  })
  identityCardFrontImg: string;

  @Field({
    description: '法人身份證反面',
  })
  identityCardBackImg: string;

  @Field(() => [OrgImageInput], {
    nullable: true,
    description: '機構門面照片',
  })
  orgFrontImg?: OrgImageInput[];

  @Field(() => [OrgImageInput], {
    nullable: true,
    description: '機構環境照片',
  })
  orgRoomImg?: OrgImageInput[];

  @Field(() => [OrgImageInput], {
    nullable: true,
    description: '機構環境照片',
  })
  orgOtherImg?: OrgImageInput[];
}
