import { CardRecordService } from './../cardRecord/card-record.service';
import {
  CANCEL_SCHEDULE_FAIL,
  COURSE_DEL_FAIL,
  COURSE_NOT_EXIST,
  SCHEDULE_RECORD_NOT_EXIST,
} from './../../common/constants/code';
import { Result } from '@/common/dto/result.type';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/common/guards/auth.guards';
import { SUCCESS } from '@/common/constants/code';
import { ScheduleRecordResult, ScheduleRecordResults } from './dto/result-schedule-record.output';
import { ScheduleRecordType } from './dto/schedule-record.type';
import { CurUserId } from '@/common/decorators/current-user.decorator';
import { PageInput } from '@/common/dto/page.input';
import { CardType, ScheduleStatus } from '@/common/constants/enmu';
import * as dayjs from 'dayjs';
import { ScheduleRecordService } from './schedule-record.service';

@Resolver(() => ScheduleRecordType)
@UseGuards(GqlAuthGuard)
export class ScheduleRecordResolver {
  constructor(
    private readonly scheduleRecordService: ScheduleRecordService,
    private readonly cardRecordService: CardRecordService,
  ) { }

  @Query(() => ScheduleRecordResult)
  async getScheduleRecordInfo(
    @Args('id') id: string,
  ): Promise<ScheduleRecordResult> {
    const result = await this.scheduleRecordService.findById(id);
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

  //獲取某個會員(學員)已預約課程的資料
  @Query(() => ScheduleRecordResults, { description: '獲取某個會員(學員)已預約課程的資料' })
  async getScheduleRecords(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
  ): Promise<ScheduleRecordResults> {
    // 第一步：獲取某會員(學員)的已預約課程資料
    const { pageNum, pageSize } = page;
    const [scheduleRecords, total] =
      await this.scheduleRecordService.findScheduleRecords({
        start: (pageNum - 1) * pageSize,
        length: pageSize,
        where: {
          student: { id: userId },
        },
      });

    const data: ScheduleRecordType[] = [];
    // 第二步：完善课程表状态
    for (const scheduleRecord of scheduleRecords) {
      let status = ScheduleStatus.NO_DO;
      const { schedule } = scheduleRecord;
      // 20230302 12:12:12
      const startTime = dayjs(
        `${dayjs(schedule.schoolDay).format('YYYYMMDD')} ${schedule.startTime}`,
        'YYYYMMDD HH:mm:ss',
      );
      // 已经开始
      if (dayjs().isAfter(startTime)) {
        status = ScheduleStatus.DOING;
      }
      const endTime = dayjs(
        `${dayjs(schedule.schoolDay).format('YYYYMMDD')} ${schedule.endTime}`,
        'YYYYMMDD HH:mm:ss',
      );

      // 已经结束了
      if (dayjs().isAfter(endTime)) {
        status = ScheduleStatus.FINISH;
      }

      if (!scheduleRecord.status) {
        data.push({
          ...scheduleRecord,
          status,
        });
      } else {
        data.push(scheduleRecord);
      }
    }
    return {
      code: SUCCESS,
      data,
      message: '獲取成功',
      page: {
        pageNum,
        pageSize,
        total,
      },
    };
  }

  @Mutation(() => Result)
  async deleteScheduleRecord(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.scheduleRecordService.findById(id);
    if (result) {
      const delRes = await this.scheduleRecordService.deleteById(id, userId);
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
      message: '门店信息不存在',
    };
  }

  // 取消已經預約的课程
  @Mutation(() => Result, { description: '取消已預約的課程' })
  async cancelSubscribeCourse(
    @Args('scheduleRecordId') scheduleRecordId: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    // 第一步：一樣按照後端撰寫接口的習慣，先進行各種校驗
    //1.校驗預約的課程是否存在
    const scheduleRecord = await this.scheduleRecordService.findById(scheduleRecordId);

    if (!scheduleRecord) {
      return {
        code: SCHEDULE_RECORD_NOT_EXIST,
        message: '沒有預約記錄，不能取消',
      };
    }

    //2.校驗該預約課程的狀況是否是已經取消的狀態
    if (scheduleRecord.status === ScheduleStatus.CANCEL) {
      return {
        code: CANCEL_SCHEDULE_FAIL,
        message: '取消失敗，不要重覆取消預约',
      };
    }

    const { schedule } = scheduleRecord;

    /*3 校驗驗預約的課程是否已經開始上課
    所以從schedule talbe裡去取得startTime欄位的資料，然後再透過dayjs()進行轉換成dayjs可以比對資料的格式*/
    const startTime = dayjs(
      `${dayjs(schedule.schoolDay).format('YYYYMMDD')} ${schedule.startTime}`,
      'YYYYMMDD HH:mm:ss',
    );

    /*若課程已經開始了，則回傳不能取消了，另外這裡要提的在實務上上課前的15鐘是不能取消的，
    所以下面用了dayjs()的subtract()的方法來判定是否在15分之前的範圍內*/
    if (dayjs().isAfter(startTime.subtract(15, 'm'))) {
      return {
        code: CANCEL_SCHEDULE_FAIL,
        message: '課程已經開始了，不能取消了',
      };
    }
    // 第二步 : 上面的校驗都完畢後，再來進行取消約並更新狀態
    const res = await this.scheduleRecordService.updateById(scheduleRecordId, {
      status: ScheduleStatus.CANCEL,
      updatedBy: userId,
    });

    if (!res) {
      return {
        code: CANCEL_SCHEDULE_FAIL,
        message: '預約記錄更新失敗',
      };
    }
    // 第三步:更新完課程的預約狀態後，則將該消費卡的可預約剩餘次數+1回去
    const cardRecord = await this.cardRecordService.findById(
      scheduleRecord.cardRecord.id,
    );
    //先判斷是否為次卡
    if (cardRecord.card.type === CardType.TIME) {
      //若為次卡，將該卡的可預剩餘約次數+1
      const res = await this.cardRecordService.updateById(cardRecord.id, {
        residueTime: cardRecord.residueTime + 1,
        updatedBy: userId,
      });
      if (!res) {
        return {
          code: CANCEL_SCHEDULE_FAIL,
          message: '更新消費於預約剩餘次數失敗',
        };
      }
    }
    return {
      code: SUCCESS,
      message: '課程取消成功',
    };
  }
}
