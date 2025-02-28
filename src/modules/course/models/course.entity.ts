import { Card } from './../../card/models/card.entity';
import { Organization } from './../../organization/models/organization.entity';
import { Entity, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm"
import { IsInt, IsNotEmpty, Min } from "class-validator"
import { CommonEntity } from "@/common/entities/common.entities"
import { ReducibleTimeType } from "../dto/common.type";
import { Teacher } from '@/modules/teacher/models/teacher.entity';

@Entity('course')

export class Course extends CommonEntity {
  @Column({
    comment: '課程名稱',
  })
  @IsNotEmpty()
  name: string;

  @Column({
    comment: '課程描述',
    nullable: true,
    type: 'text',
  })
  desc: string;

  @Column({
    comment: '適齡人群',
  })
  @IsNotEmpty()
  group: string;

  @Column({
    comment: '適合基礎',
  })
  @IsNotEmpty()
  baseAbility: string;

  @Column({
    comment: '限制上課人數',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  limitNumber: number;

  @Column({
    comment: '持續時間',
  })
  @IsNotEmpty()
  duration: number;

  @Column({
    comment: '預约信息',
    nullable: true,
  })
  reserveInfo: string;

  @Column({
    comment: '退款信息',
    nullable: true,
  })
  refundInfo: string;

  @Column({
    comment: '其他信息',
    nullable: true,
  })
  otherInfo: string;

  @Column({
    comment: '封面圖',
    nullable: true,
  })
  coverUrl: string;

  /**
  使用simple-json這個參數，就可以讓typeorm將物件的資料轉成json格式，
  不論是寫入或是讀取，它都可以自動幫你轉成json格式*/

  @Column('simple-json', {
    comment: '可預約時間(JSON格式)',
    nullable: true,
  })
  reducibleTime: ReducibleTimeType[];

  /*不同的課程會對應單一不同的門市，所以這樣使用多對一*/
  /*在門市Organization的entity則需要設置一對多OneToMany的關係，也就是一個門市會有多個不同的課*/
  @ManyToOne(() => Organization, (org) => org.courses, {
    //cascade為級聯操作的屬性，表示當對 Course 實體執行儲存（save）或刪除（remove）**操作時，相關的 Organization 也會自動更新。
    cascade: true,
  })
  org: Organization;

  @OneToMany(() => Card, (org) => org.course)
  cards: Card;

  //一個老師會教各試各樣的課程，同樣的某一個課程也會有多個老師在教，所以課程與老師是多對多的關係
  @ManyToMany(() => Teacher, { cascade: true })
  @JoinTable({  //多對多的關係要另外再加個table
    name: 'course_teacher',
  })
  teachers: Teacher[];
}