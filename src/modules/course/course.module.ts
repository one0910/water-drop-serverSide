import { Module, ConsoleLogger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './models/course.entity';
import { CourseServices } from './course.services';
import { CourseResolver } from './course.resolver';


@Module({
  imports: [
    TypeOrmModule.forFeature([Course])
  ],
  providers: [CourseServices, CourseResolver],
  exports: [CourseServices]
})

export class CourseModule { }
