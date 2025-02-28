import { DeepPartial, FindOptionsWhere, Like } from 'typeorm';
import { COURSE_CREATE_FAIL, COURSE_DEL_FAIL, COURSE_NOT_EXIST, COURSE_UPDATE_FAIL, REGISTER_ERROR, STUDENT_NOT_EXIST } from '@/common/constants/code';
import { PageInput } from '@/common/dto/page.input';
import { CourseResult, CourseResults } from './dto/result-course.output';
import { SUCCESS, UPDATE_ERROR } from '@/common/constants/code';
import { Result } from '@/common/dto/result.type';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CourseServices } from "./course.services";
import { CourseInput, PartialCourseInput } from "./dto/course.input";
import { CourseType } from "./dto/course.type";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/auth.guards";
import { CurUserId } from '@/common/decorators/current-user.decorator';
import { Course } from './models/course.entity';
import { CurOrgId } from '@/common/decorators/current-org.decorator';

@UseGuards(GqlAuthGuard)
@Resolver(CourseType)
export class CourseResolver {
  constructor(private readonly courseService: CourseServices) { }

  //建立或更新資料
  @Mutation(() => CourseResult, { description: '建立或更新課程資料' })
  async commitCourseInfo(
    // @Args('params') params: CourseInput,
    @Args('params') params: PartialCourseInput,
    @CurUserId() userId: string,
    @CurOrgId() orgId: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<Result> {
    //新建課程
    if (!id) {
      const res = await this.courseService.create({
        ...params,
        teachers: params.teachers.map((item) => ({ id: item })),
        createdBy: userId,
        /**
        由於課程及門市實體的關係為1對多、多對1，所以參數上就必須以org: {}物件方式這樣的寫法用來新增或更新資料，除了下面寫法外
        例如可以寫成org: {id: orgId, tel:'098009'},，除了會關聯門市的id外，也會更新該id門市tel欄位的資料*/
        org: {
          id: orgId,
        },
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '創建成功',
        };
      }
      return {
        code: COURSE_CREATE_FAIL,
        message: '創建失败',
      };
    }

    //更新課程
    const course = await this.courseService.findById(id);
    if (course) {
      const courseInput: DeepPartial<Course> = {
        ...params,
        teachers: course.teachers,
        updatedBy: userId,
      };

      /*由於courseInput裡面的teachers資料是整個teachers的實體資料，也就是TypeROM會把teacher所有欄位的資料整個返迴
      但由於我們這邊的course.input設計是只接收string[]也就是只有字串的陣列資料
      所以我們將courseInput.teachers做一下修改,如下所示,改成teachersID的純字串陣列
      而純字串陣列的資料也才能做多對多的關聯(courseId <-> teacherId)，也才能將資料寫入到course_teacher的table裡*/
      if (params.teachers) {
        courseInput.teachers = params.teachers.map((item) => ({ id: item }));
      }

      const res = await this.courseService.updateById(course.id, courseInput);
      if (res) {
        return {
          code: SUCCESS,
          message: '更新成功',
        };
      }
      return {
        code: COURSE_UPDATE_FAIL,
        message: '更新失败',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: '課程信息不存在',
    };
  }

  //獲取課程筆數的資料
  @Query(() => CourseResults, { description: '獲取課程筆數的資料' })
  async getCourses(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
    @CurOrgId() orgId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<CourseResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<Course> = {
      createdBy: userId,
      org: {
        id: orgId,
      },
    };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    const [results, total] = await this.courseService.find({
      start: (pageNum - 1) * pageSize,
      length: pageSize,
      where,
    });
    return {
      code: SUCCESS,
      data: results,
      page: {
        pageNum,
        pageSize,
        total,
      },
      message: '獲取成功',
    };
  }

  //使用ID獲取某筆課程詳細資料
  @Query(() => CourseResult, { description: '使用ID獲取某筆課程詳細資料' })
  async getCourseInfo(@Args('id') id: string): Promise<CourseResult> {
    const result = await this.courseService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '獲取成功',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: '課程信息不存在',
    };
  }

  //軟刪除課程資料
  @Mutation(() => Result, { description: '軟刪除課程資料' })
  async softDeleteCorse(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.courseService.findById(id);
    if (result) {
      const delRes = await this.courseService.softDeleteById(id, userId);
      if (delRes) {
        return {
          code: SUCCESS,
          message: '删除成功',
        };
      }
      return {
        code: COURSE_DEL_FAIL,
        message: '删除失败',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: '門店信息不存在',
    };
  }

}