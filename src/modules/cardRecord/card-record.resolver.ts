import { FindOptionsWhere } from 'typeorm';
import { CardRecord } from './models/card-record.entity';
import { CARD_NOT_EXIST, COURSE_DEL_FAIL, COURSE_NOT_EXIST } from '../../common/constants/code';
import { Result } from '@/common/dto/result.type';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SUCCESS } from '@/common/constants/code';
import { CardRecordResult, CardRecordResults } from './dto/result-card-record.output';
import { CardRecordType } from './dto/card-record.type';
import { CardRecordService } from './card-record.service';
import { CurUserId } from '@/common/decorators/current-user.decorator';
import { PageInput } from '@/common/dto/page.input';
import { CardStatus, CardType } from '@/common/constants/enmu';
import * as dayjs from 'dayjs';
import { GqlAuthGuard } from '@/common/guards/auth.guards';

@Resolver(() => CardRecordType)
@UseGuards(GqlAuthGuard)
export class CardRecordResolver {
  constructor(private readonly cardRecordService: CardRecordService) { }

  //取得單個消費卡訊息
  @Query(() => CardRecordResult)
  async getCardRecordInfo(@Args('id') id: string): Promise<CardRecordResult> {
    const result = await this.cardRecordService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '獲取成功',
      };
    }
    return {
      code: CARD_NOT_EXIST,
      message: '消費卡資料不存在',
    };
  }

  //取得會員(學員)購買商品(課程)後，他所擁用的消費費卡資料 - 手機版
  @Query(() => CardRecordResults, { description: '獲取個人的消费卡' })
  async getCardRecordsForH5(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
  ): Promise<CardRecordResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<CardRecord> = {
      student: { id: userId },
    };
    const [results, total] = await this.cardRecordService.findCardRecords({
      start: (pageNum - 1) * pageSize,
      length: pageSize,
      where,
    });

    //這邊做一個消費卡目前使用狀態的判斷並更新
    const newRes = results.map((c) => {
      let status = CardStatus.VALID;

      // 該消費卡若是過期了
      if (dayjs().isAfter(c.endTime)) {
        status = CardStatus.EXPIRED;
      }

      //  該消費卡若是使用完了
      if (c.card.type === CardType.TIME && c.residueTime === 0) {
        status = CardStatus.DEPLETE;
      }

      return {
        ...c,
        status,
      };

    });

    // **新增排序邏輯**: 先 EXPIRED, 再 DEPLETE, 最後 VALID
    newRes.sort((a, b) => {
      const statusOrder = {
        [CardStatus.EXPIRED]: 0,
        [CardStatus.DEPLETE]: 1,
        [CardStatus.VALID]: 2,
      };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return {
      code: SUCCESS,
      data: newRes,
      page: {
        pageNum,
        pageSize,
        total,
      },
      message: '獲取成功',
    };
  }

  //取得多個消費費卡記錄 - PC管理頁面版
  @Query(() => CardRecordResults)
  async getCardRecords(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
  ): Promise<CardRecordResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<CardRecord> = { createdBy: userId };
    const [results, total] = await this.cardRecordService.findCardRecords({
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

  //軟刪除消費卡記錄
  @Mutation(() => Result)
  async deleteCardRecord(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.cardRecordService.findById(id);
    if (result) {
      const delRes = await this.cardRecordService.deleteById(id, userId);
      if (delRes) {
        return {
          code: SUCCESS,
          message: '删除成功',
        };
      }
      return {
        code: COURSE_DEL_FAIL,
        message: '删除失敗',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: '門店資料不存在',
    };
  }

  // 獲取目前會員(學員)在某個課程上可以用的消費卡
  @Query(() => CardRecordResults, { description: '獲取目前會員(學員)在某個課程上可以用的消費卡' })
  async getUseCardRecordsByCourse(
    @Args('courseId') courseId: string,
    @CurUserId() userId: string,
  ): Promise<CardRecordResults> {
    const [cards, total] = await this.cardRecordService.findUseCards(userId, courseId);

    return {
      code: SUCCESS,
      message: '獲取成功',
      data: cards,
      page: {
        total,
      },
    };
  }
}
