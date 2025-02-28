import { REGISTER_ERROR } from '@/common/constants/code';
import { PageInput } from './../../common/dto/page.input';
import { UserResult, UserResults } from './dto/result-user.output';
import { SUCCESS, UPDATE_ERROR } from './../../common/constants/code';
import { Result } from './../../common/dto/result.type';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UserServices } from "./user.services";
import { UserInput } from "./dto/user-input.type";
import { UserType } from "./dto/user.type";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/auth.guards";
import { CurUserId } from '@/common/decorators/current-user.decorator';

@UseGuards(GqlAuthGuard)
@Resolver()
export class UserResolver {
  constructor(private readonly useService: UserServices) { }

  //新增用戶資料
  @Mutation(() => UserResult, { description: '新增用戶' })
  async create(@Args('params') params: UserInput): Promise<UserResult> {

    const res = await this.useService.addUser(params)
    if (res) {
      return {
        code: SUCCESS,
        message: '註冊成功',
      };
    } else {
      return {
        code: REGISTER_ERROR,
        message: '註冊失敗',
      };
    }
  }

  //查詢用戶資料
  @Query(() => UserType, { description: '使用ID查詢用戶料' })
  async find(@Args('id') id: string): Promise<UserType> {
    const res = await this.useService.findUser(id)
    return res
  }

  //獲取用戶資料
  @Query(() => UserType, { description: '使用ID查詢用戶資料' })
  async getUserInfo(@CurUserId() userId: string): Promise<UserType> {
    // const id = cxt.req.user?.id
    //原來是要透過@Context()來取得req裡的資料，現在透過自定義的裝飾器CurUserId來直接取得userId
    const res = await this.useService.findUser(userId)
    return res
  }

  //獲取用戶數量
  @Query(() => UserResults, { description: '查詢目前用戶數量' })
  async getUsers(@Args('page') page: PageInput): Promise<UserResults> {
    const { pageNum, pageSize } = page;
    const [results, total] = await this.useService.findUsers({
      start: (pageNum - 1) * pageSize,
      length: pageSize,
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
        message: '查詢成功',
      }
    }
  }

  //更新用戶資料
  @Mutation(() => Result, { description: '更新用戶資料' })
  async updateUserInfo(
    @Args('id') id: string,
    @Args('params') params: UserInput
  ): Promise<Result> {
    const res = await this.useService.updateUser(id, params)
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

  //刪除戶資料
  @Mutation(() => Boolean, { description: '刪除一個用戶' })
  async delete(
    @Args('id') id: string,
  ): Promise<boolean> {
    const res = await this.useService.deleteUser(id)
    return res
  }
}