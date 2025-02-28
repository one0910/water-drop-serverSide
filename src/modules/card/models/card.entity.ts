import { Organization } from '@/modules/organization/models/organization.entity';
import { Course } from '@/modules/course/models/course.entity';
import { Entity, Column, ManyToOne } from "typeorm"
import { IsNotEmpty } from "class-validator"
import { CommonEntity } from "@/common/entities/common.entities"

// 消费卡類型
export enum CardType {
  TIME = 'time',
  DURATION = 'duration',
}


@Entity('card')

/**
 * 消费卡
*/
export class Card extends CommonEntity {
  @Column({
    comment: '名稱',
    default: '',
  })
  name: string;

  @Column({
    comment: '卡類型',
    default: CardType.TIME,
  })
  @IsNotEmpty()
  type: string;

  @Column({
    comment: '上課次數',
    default: 0,
  })
  time: number;

  @Column({
    comment: '有效期',
    default: 0,
  })
  validityDay: number;

  // 關聯課程
  @ManyToOne(() => Course, (course) => course.cards, {
    cascade: true,
  })
  course: Course;

  //關聯門店
  @ManyToOne(() => Organization, (org) => org.cards, {
    cascade: true,
  })
  org: Organization;
}