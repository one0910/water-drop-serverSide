import { Module, ConsoleLogger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './models/schedule.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleResolver } from './schedule.resolver';
import { CourseModule } from '../course/course.module';
import { CardRecordModule } from '../cardRecord/card-record.module';
import { ScheduleRecordModule } from '../schedule-record/schedule-record.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule]),
    CourseModule,
    CardRecordModule,
    ScheduleRecordModule
  ],
  providers: [ScheduleService, ScheduleResolver],
  exports: [ScheduleService]
})

export class ScheduleModule { }
