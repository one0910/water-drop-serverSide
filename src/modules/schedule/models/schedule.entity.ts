import { CommonEntity } from '@/common/entities/common.entities';
import { Course } from '@/modules/course/models/course.entity';
import { Organization } from '@/modules/organization/models/organization.entity';
import { ScheduleRecord } from '@/modules/schedule-record/models/schedule-record.entity';
import { Teacher } from '@/modules/teacher/models/teacher.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

/**
 * 課程表
 */
@Entity('schedule')
export class Schedule extends CommonEntity {
  @Column({
    comment: '上課日期',
    nullable: true,
    type: 'timestamp',
  })
  schoolDay: Date;

  @Column({
    comment: '開始時間',
    nullable: true,
  })
  startTime: string;

  @Column({
    comment: '結束時間',
    nullable: true,
  })
  endTime: string;

  @Column({
    comment: '人數限制',
    nullable: true,
  })
  limitNumber: number;

  @ManyToOne(() => Organization, {
    cascade: true,
  })
  org: Organization;

  @ManyToOne(() => Course, {
    cascade: true,
  })
  course: Course;

  @ManyToOne(() => Teacher, {
    cascade: true,
  })
  teacher?: Teacher;

  @OneToMany(
    () => ScheduleRecord,
    (scheduleRecord) => scheduleRecord.schedule
  )
  scheduleRecords?: ScheduleRecord[];
}
