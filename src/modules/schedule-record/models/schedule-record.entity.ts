import { CommonEntity } from '@/common/entities/common.entities';
import { CardRecord } from '@/modules/cardRecord/models/card-record.entity';
import { Course } from '@/modules/course/models/course.entity';
import { Organization } from '@/modules/organization/models/organization.entity';
import { Schedule } from '@/modules/schedule/models/schedule.entity';
import { Student } from '@/modules/student/models/student.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

/**
 * y課程表記錄录
 */
@Entity('schedule_record')
export class ScheduleRecord extends CommonEntity {
  @Column({
    comment: '預約時間',
    type: 'timestamp',
    nullable: true,
  })
  subscribeTime: Date;

  @Column({
    comment: '狀態',
    nullable: true,
  })
  status: string;

  @ManyToOne(() => Student, { cascade: true })
  student: Student;

  @ManyToOne(() => CardRecord, { cascade: true })
  cardRecord: CardRecord;

  @ManyToOne(
    () => Schedule,
    (schedule) => schedule.scheduleRecords,
    { cascade: true, }
  )
  schedule: Schedule;

  @ManyToOne(() => Course, { cascade: true })
  course: Course;

  @ManyToOne(() => Organization, {
    cascade: true,
  })
  org: Organization;
}
