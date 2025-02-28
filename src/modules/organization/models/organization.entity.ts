
import { CommonEntity } from '@/common/entities/common.entities';
import { Card } from '@/modules/card/models/card.entity';
import { Course } from '@/modules/course/models/course.entity';
import { OrgImage } from '@/modules/orgImage/models/orgImage.entity';
import { Product } from '@/modules/product/models/product.entity';
import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';


/**
 * 组件
 */
@Entity('organization')
export class Organization extends CommonEntity {
  @Column({
    comment: '營業執照',
  })
  @IsNotEmpty()
  businessLicense: string;

  @Column({
    comment: '法人身份證正面',
  })
  @IsNotEmpty()
  identityCardFrontImg: string;

  @Column({
    comment: '法人身份證正面',
  })
  @IsNotEmpty()
  identityCardBackImg: string;

  @Column({
    type: 'text',
    comment: '標簽以，隔開',
    nullable: true,
  })
  tags: string;

  @Column({
    type: 'text',
    comment: '簡介',
    nullable: true,
  })
  description: string;

  @Column({
    comment: '機構名',
    nullable: true,
    default: '',
  })
  name: string;

  @Column({
    comment: 'logo',
    nullable: true,
  })
  logo: string;

  @Column({
    comment: '地址',
    nullable: true,
  })
  address: string;

  @Column({
    comment: '經度',
    nullable: true,
  })
  longitude: string;

  @Column({
    comment: '緯度',
    nullable: true,
  })
  latitude: string;

  @Column({
    comment: '電话',
    nullable: true,
  })
  tel: string;

  //機構對圖片來說就是一對多的關係
  @OneToMany(() => OrgImage, (orgImage) => orgImage.orgIdForFront, {
    cascade: true
  })
  orgFrontImg?: OrgImage[]

  @OneToMany(() => OrgImage, (orgImage) => orgImage.orgIdForRoom, {
    cascade: true
  })
  orgRoomImg?: OrgImage[]

  @OneToMany(() => OrgImage, (orgImage) => orgImage.orgIdForOther, {
    cascade: true
  })
  orgOtherImg?: OrgImage[]

  @OneToMany(() => Course, (course) => course.org)
  courses: Course[];

  @OneToMany(() => Card, (card) => card.org)
  cards: Card[];

  @OneToMany(() => Product, (product) => product.org)
  products: Product[];
}
