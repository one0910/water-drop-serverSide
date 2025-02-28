import { COURSE_CREATE_FAIL, COURSE_DEL_FAIL, COURSE_NOT_EXIST, COURSE_UPDATE_FAIL, REGISTER_ERROR, STUDENT_NOT_EXIST } from '@/common/constants/code';
import { PageInput } from '@/common/dto/page.input';
import { WxorderResult, WxorderResults } from './dto/result-wxorder.output';
import { SUCCESS, UPDATE_ERROR } from '@/common/constants/code';
import { Result } from '@/common/dto/result.type';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { WxorderService } from "./wxorder.service";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/auth.guards";
import { CurUserId } from '@/common/decorators/current-user.decorator';
import { FindOptionsWhere, Like } from 'typeorm';
import { Wxorder } from './models/wxorder.entity';

@UseGuards(GqlAuthGuard)
@Resolver()
export class WxorderResolver {
  constructor(private readonly wxorderService: WxorderService) { }

  //獲取某筆詳細資料
  @Query(() => WxorderResult, { description: '使用ID查詢用戶資料' })
  async getWxorderInfo(
    @Args('id') id: string,
  ): Promise<WxorderResult> {
    const result = await this.wxorderService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '獲取成功',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: '微信訂單資料不存在',
    };
  }

  //獲取微信訂單筆數的資料
  @Query(() => WxorderResults, { description: '獲取微信訂單筆數的資料' })
  async getWxorders(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
  ): Promise<WxorderResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<Wxorder> = { createdBy: userId };

    const [results, total] = await this.wxorderService.find({
      start: (pageNum - 1) * pageSize,
      length: pageSize,
      where,
    })
    if (results) {
      return {
        code: SUCCESS,
        data: results,
        page: {
          pageNum,
          pageSize,
          total
        },
        message: '獲取成功',
      }
    }
  }

  //軟刪除微信訂單資料
  @Mutation(() => Result, { description: '軟刪除微信訂單資料' })
  async softDeleteWxorder(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.wxorderService.findById(id);
    if (result) {
      const delRes = await this.wxorderService.softDeleteById(id, userId);
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
      message: '微信訂單資料不存在',
    };
  }
}