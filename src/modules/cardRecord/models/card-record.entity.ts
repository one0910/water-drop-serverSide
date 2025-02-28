import { CommonEntity } from '@/common/entities/common.entities';
import { Card } from '@/modules/card/models/card.entity';
import { Course } from '@/modules/course/models/course.entity';
import { Organization } from '@/modules/organization/models/organization.entity';
import { Student } from '@/modules/student/models/student.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

/**
 * 個人的消费卡
 */
@Entity('card_record')
export class CardRecord extends CommonEntity {
  @Column({
    comment: '開始時間',
    type: 'timestamp',
    nullable: true,
  })
  startTime: Date;

  @Column({
    comment: '结束時間',
    type: 'timestamp',
    nullable: true,
  })
  endTime: Date;

  @Column({
    comment: '購買時間',
    type: 'timestamp',
    nullable: true,
  })
  buyTime: Date;

  @Column({
    comment: '剩餘次數',
    nullable: true,
  })
  residueTime: number;

  /*由於cardRecord是用來記錄消費卡的相關記錄，所以cardRecord裡會有多張卡片的生成記錄
  ，因此使用多對一的關係*/
  @ManyToOne(() => Card, {
    cascade: true,
  })
  card: Card;

  /*除了消費卡，使用會員(學員)也是會有多個，因此也是使用多對一的關係*/
  @ManyToOne(() => Student, {
    cascade: true,
  })
  student: Student;

  /*可以用此cardRecord來記錄課程，那當然它也以記錄多個課程，因此也是用多對一的關係*/
  @ManyToOne(() => Course, {
    cascade: true,
  })
  course: Course;

  //cardRecord也會記錄消費者卡是屬於哪個門店的，也是用多對一的關係，
  @ManyToOne(() => Organization, {
    cascade: true,
  })
  org: Organization;
}
