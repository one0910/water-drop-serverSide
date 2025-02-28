import { COURSE_CREATE_FAIL, COURSE_DEL_FAIL, COURSE_NOT_EXIST, COURSE_UPDATE_FAIL, PRODUCT_CREATE_FAIL, REGISTER_ERROR, STUDENT_NOT_EXIST } from '@/common/constants/code';
import { PageInput } from '@/common/dto/page.input';
import { StudentResult, StudentResults } from './dto/result-student.output';
import { SUCCESS, UPDATE_ERROR } from '@/common/constants/code';
import { Result } from '@/common/dto/result.type';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { StudentService } from "./student.service";
import { StudentInput } from "./dto/student.input";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/auth.guards";
import { CurUserId } from '@/common/decorators/current-user.decorator';
import { FindOptionsWhere, Like } from 'typeorm';
import { Student } from './models/student.entity';

@UseGuards(GqlAuthGuard)
@Resolver()
export class StudentResolver {
  constructor(private readonly studentService: StudentService) { }

  //更新資料
  @Mutation(() => StudentResult, { description: '新增學生資料' })
  async commitStudentInfo(
    @Args('params') params: StudentInput,
    @CurUserId() userId: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<Result> {
    //新增學生資料
    if (!id) {
      const res = await this.studentService.create({
        ...params,
        createdBy: userId,
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '新增成功',
        };
      }
      return {
        code: PRODUCT_CREATE_FAIL,
        message: '新增失敗',
      };
    }

    //更新學生資料
    const student = await this.studentService.findById(userId);
    if (student) {
      const res = await this.studentService.updateById(student.id, params);
      if (res) {
        return {
          code: SUCCESS,
          message: '更新成功',
        };
      }
    }
    return {
      code: STUDENT_NOT_EXIST,
      message: '學生資料不存在',
    };
  }

  //獲取某筆詳細資料
  @Query(() => StudentResult)
  async getStudentInfo(@CurUserId() userId: string): Promise<StudentResult> {
    const result = await this.studentService.findById(userId);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '獲取成功',
      };
    }
    return {
      code: STUDENT_NOT_EXIST,
      message: '學生信息不存在',
    };
  }

  //獲取學生筆數的資料
  @Query(() => StudentResults, { description: '獲取學生筆數的資料' })
  async getStudents(@Args('page') page: PageInput): Promise<StudentResults> {
    const { pageNum, pageSize } = page;
    const [results, total] = await this.studentService.find({
      start: (pageNum - 1) * pageSize,
      length: pageSize,
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


  //軟刪除學生資料
  @Mutation(() => Result, { description: '軟刪除學生資料' })
  async softDeleteStudent(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.studentService.findById(id);
    if (result) {
      const delRes = await this.studentService.softDeleteById(id, userId);
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
      message: '學生資料不存在',
    };
  }
}