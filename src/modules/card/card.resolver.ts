import { CARD_CREATE_FAIL, CARD_DEL_FAIL, CARD_NOT_EXIST, CARD_UPDATE_FAIL, REGISTER_ERROR, STUDENT_NOT_EXIST } from '@/common/constants/code';
import { PageInput } from '@/common/dto/page.input';
import { CardResult, CardResults } from './dto/result-card.output';
import { SUCCESS, UPDATE_ERROR } from '@/common/constants/code';
import { Result } from '@/common/dto/result.type';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CardServices } from "./card.services";
import { CardInput } from "./dto/card.input.type";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/auth.guards";
import { CurUserId } from '@/common/decorators/current-user.decorator';
import { FindOptionsWhere, Like } from 'typeorm';
import { Card } from './models/card.entity';
import { CurOrgId } from '@/common/decorators/current-org.decorator';

@UseGuards(GqlAuthGuard)
@Resolver()
export class CardResolver {
  constructor(private readonly cardService: CardServices) { }

  //建立或更新消費卡資料
  @Mutation(() => CardResult, { description: '新增消費卡資料' })
  async commitCardInfo(
    @Args('params') params: CardInput,
    @Args('courseId') courseId: string,
    @CurUserId() userId: string,
    @CurOrgId() orgId: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<CardResult> {
    //建立新的消費卡
    if (!id) {
      const res = await this.cardService.create({
        ...params,
        course: {
          id: courseId
        },
        org: {
          id: orgId,
        },
        createdBy: userId,
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '創建成功',
        };
      }
      return {
        code: CARD_CREATE_FAIL,
        message: '創建失败',
      };
    }

    //更新消費卡
    const card = await this.cardService.findById(id)
    if (card) {
      const res = await this.cardService.updateById(card.id, {
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
        code: CARD_UPDATE_FAIL,
        message: '更新失败',
      };
    }
    return {
      code: CARD_NOT_EXIST,
      message: '消費卡信息不存在',
    };
  }

  //獲取某清費卡筆詳細資料
  @Query(() => CardResult, { description: '使用ID查詢用戶資料' })
  async getCardInfo(
    @Args('id') id: string,
  ): Promise<CardResult> {
    const result = await this.cardService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '獲取成功',
      };
    }
    return {
      code: CARD_NOT_EXIST,
      message: '消費卡信息不存在',
    };
  }

  //獲取消費卡筆數的資料
  @Query(() => CardResults, { description: '獲取消費卡筆數的資料' })
  async getCards(
    @Args('courseId') courseId: string,
    @CurUserId() userId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<CardResults> {
    const where: FindOptionsWhere<Card> = {
      createdBy: userId,
      course: {
        id: courseId,
      },
    };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    const [results] = await this.cardService.find({
      where,
    });

    if (results) {
      return {
        code: SUCCESS,
        data: results,
        message: '獲取成功',
      }
    }
  }

  //軟刪除消費卡筆資料
  @Mutation(() => Result, { description: '軟刪除消費卡筆資料' })
  async softDeleteCard(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.cardService.findById(id);
    if (result) {
      const delRes = await this.cardService.softDeleteById(id, userId);
      if (delRes) {
        return {
          code: SUCCESS,
          message: '删除成功',
        };
      }
      return {
        code: CARD_DEL_FAIL,
        message: '删除失败',
      };
    }
    return {
      code: CARD_NOT_EXIST,
      message: '消費卡不存在',
    };
  }
}