import { COURSE_CREATE_FAIL, COURSE_DEL_FAIL, COURSE_NOT_EXIST, COURSE_UPDATE_FAIL, REGISTER_ERROR, STUDENT_NOT_EXIST } from '@/common/constants/code';
import { PageInput } from '@/common/dto/page.input';
import { TeacherResult, TeacherResults } from './dto/result-teacher.output';
import { SUCCESS, UPDATE_ERROR } from '@/common/constants/code';
import { Result } from '@/common/dto/result.type';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { TeacherService } from "./teacher.service";
import { TeacherInput } from "./dto/teacher.input";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/auth.guards";
import { CurUserId } from '@/common/decorators/current-user.decorator';
import { FindOptionsWhere, Like } from 'typeorm';
import { Teacher } from './models/teacher.entity';
import { CurOrgId } from '@/common/decorators/current-org.decorator';

@UseGuards(GqlAuthGuard)
@Resolver()
export class TeacherResolver {
  constructor(private readonly teacherService: TeacherService) { }

  //建立或更新資料
  @Mutation(() => TeacherResult, { description: '新增教師資料' })
  async commitTeacherInfo(
    @Args('params') params: TeacherInput,
    @CurUserId() userId: string,
    @CurOrgId() orgId: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<TeacherResult> {
    //新增資料
    if (!id) {
      const res = await this.teacherService.create({
        ...params,
        createdBy: userId,
        org: {
          id: orgId,
        },
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '新增成功',
        };
      }
      return {
        code: COURSE_CREATE_FAIL,
        message: '新增失敗',
      };
    }

    //編輯資料
    const teacher = await this.teacherService.findById(id);
    if (teacher) {
      const res = await this.teacherService.updateById(teacher.id, {
        ...params,
        updatedBy: userId,
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '更新成功',
        };
      }
      return {
        code: COURSE_UPDATE_FAIL,
        message: '更新失敗',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: '教師資料不存在',
    };
  }

  //獲取某筆詳細資料
  @Query(() => TeacherResult, { description: '使用ID查詢用戶資料' })
  async getTeacherInfo(
    @Args('id') id: string,
  ): Promise<TeacherResult> {
    const result = await this.teacherService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '獲取成功',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: '教師資料不存在',
    };
  }
  //獲取教師筆數的資料
  @Query(() => TeacherResults)
  async getTeachers(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
    @CurOrgId() orgId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<TeacherResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<Teacher> = {
      createdBy: userId,
      org: {
        id: orgId,
      },
    };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    const [results, total] = await this.teacherService.find({
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

  //更新xx資料
  @Mutation(() => Result, { description: '更新xx資料' })
  async updateTeacherInfo(
    @Args('id') id: string,
    @Args('params') params: TeacherInput
  ): Promise<Result> {
    const res = await this.teacherService.updateById(id, params)
    if (res) {
      return {
        code: SUCCESS,
        message: '更新成功'
      }
    }
    return {
      code: UPDATE_ERROR,
      message: '更新失敗'
    }
  }

  //軟刪除教師資料
  @Mutation(() => Result, { description: '軟刪除xx資料' })
  async softDeleteTeacher(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.teacherService.findById(id);
    if (result) {
      const delRes = await this.teacherService.softDeleteById(id, userId);
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
      message: '教師資料不存在',
    };
  }
}