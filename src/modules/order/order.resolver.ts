import { COURSE_DEL_FAIL, COURSE_NOT_EXIST } from '@/common/constants/code';
import { PageInput } from '@/common/dto/page.input';
import { OrderResult, OrderResults } from './dto/result-order.output';
import { SUCCESS } from '@/common/constants/code';
import { Result } from '@/common/dto/result.type';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrderService } from "./order.service";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/auth.guards";
import { CurUserId } from '@/common/decorators/current-user.decorator';
import { FindOptionsWhere } from 'typeorm';
import { Order } from './models/order.entity';

@UseGuards(GqlAuthGuard)
@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService) { }

  //獲取某筆詳細資料
  @Query(() => OrderResult, { description: '使用ID查詢用戶資料' })
  async getOrderInfo(
    @Args('id') id: string,
  ): Promise<OrderResult> {
    const result = await this.orderService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '獲取成功',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: 'xx資料不存在',
    };
  }

  //獲取xx筆數的資料
  @Query(() => OrderResults, { description: '獲取xx筆數的資料' })
  async getOrders(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<OrderResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<Order> = { createdBy: userId };
    if (name) {
      // where.name = Like(`%${name}%`);
    }
    const [results, total] = await this.orderService.find({
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

  //軟刪除xx資料
  @Mutation(() => Result, { description: '軟刪除xx資料' })
  async softDeleteOrder(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.orderService.findById(id);
    if (result) {
      const delRes = await this.orderService.softDeleteById(id, userId);
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
      message: 'xx資料不存在',
    };
  }
}