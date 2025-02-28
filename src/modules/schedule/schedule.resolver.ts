import { FindOptionsWhere } from 'typeorm';
import { Schedule } from './models/schedule.entity';
import {
  CARD_DEPLETE,
  CARD_EXPIRED,
  CARD_NOT_EXIST,
  CARD_RECORD_EXIST,
  COURSE_DEL_FAIL,
  COURSE_NOT_EXIST,
  SCHEDULE_CREATE_FAIL,
  SCHEDULE_HAD_SUBSCRIBE,
  SCHEDULE_NOT_EXIST,
  SUBSCRIBE_FAIL,
} from './../../common/constants/code';
import { Result } from '@/common/dto/result.type';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/common/guards/auth.guards';
import { SUCCESS } from '@/common/constants/code';
import { ScheduleResult, ScheduleResults } from './dto/result-schedule.output';
import { ScheduleType } from './dto/schedule.type';
import { ScheduleService } from './schedule.service';
import { CurUserId } from '@/common/decorators/current-user.decorator';
import { CurOrgId } from '@/common/decorators/current-org.decorator';
import { CourseServices } from '../course/course.services';
import { OrderTimeType } from '../course/dto/common.type';
import { CardRecordService } from '../cardRecord/card-record.service';
import { OrganizationResults } from '../organization/dto/result-organization.output';
import { OrganizationType } from '../organization/dto/organization.type';
import * as _ from 'lodash';
import * as dayjs from 'dayjs';
import { CardType } from '@/common/constants/enmu';
import { ScheduleRecordService } from '../schedule-record/schedule-record.service';

/**
 * 课程表
 */
@Resolver(() => ScheduleType)
@UseGuards(GqlAuthGuard)
export class ScheduleResolver {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly courseService: CourseServices,
    private readonly scheduleRecordService: ScheduleRecordService,
    private readonly cardRecordService: CardRecordService,
  ) { }

  @Query(() => ScheduleResult)
  async getScheduleInfo(@Args('id') id: string): Promise<ScheduleResult> {
    const result = await this.scheduleService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '获取成功',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: '课程信息不存在',
    };
  }

  //開始排課建立課程(提供一個起始及結束日，然後開始針對其區間安排預約課程)
  @Mutation(() => Result, { description: '開始排课' })
  async autoCreateSchedule(
    @Args('startDay') startDay: string, //開始時期
    @Args('endDay') endDay: string, //結束日期
    @CurUserId() userId: string,
    @CurOrgId() orgId: string,
  ): Promise<Result> {
    // 1 先去取得該前門店下的所有課程
    const [courses] = await this.courseService.find({
      where: { org: { id: orgId } },
      start: 0,
      length: 100, //一個門店的教師有限(實際上人力也是有上限的)，所以這裡做一個限制就是一個門店就只提供100門課
    });

    const schedules = [];

    /*2 遍歷課程資料，並拿到每個課程的可约約時間，另外這裡用for...of的方式而非forEach或map做遍歷
    是因為有await非同步的程序要處理，若使用forEach或map做遍歷，它會無法等待await非同步程理*/
    for (const course of courses) {
      // {"week":"monday","orderTime":[{"key":7, "startTime":"", "endTime":""}]}]
      //a.先把課程中的己設定的可約時間提取出來
      const reducibleTime = course.reducibleTime;
      const newReducibleTime: Record<string, OrderTimeType[]> = {};

      for (const rt of reducibleTime) {
        /*b.把可約時間轉成
        {
          "monday":{startTime:'12:00',endTime:'23:59:00',key:1},
          "tuesday:{startTime:'12:00',endTime:'23:30:00',key:1}"
        }
        這樣的物件格式，就是包了一個以星期幾為key，可預約時間為value的物件格底*/
        newReducibleTime[rt.week] = rt.orderTime;
      }
      //先將startDay轉成dayjs的物件格式。讓我們等下可以做時間格式、時區的轉換、計算時間差、加減時間等，方便處理、儲存
      let curDay = dayjs(startDay);

      // 3 从开始的日期到结束的日期，判断是周几，然后就用周几的排课规则（可约时间）
      /*(curDay.isBefore(dayjs(endDay).add(1, 'd'))) 這段程式碼的用意可以確保startDay及EndDay都可以進入到排課的程序裡
      例如我的startDay是'2025-02-10',endDay是'2025-02-14，那 (curDay.isBefore(dayjs(endDay).add(1, 'd')))
      就會開始從'2025-02-10'開始一直算到'2025-10-15'來判斷startDay及endDay是否在這區間裡，如果是則回傳true，若否則回傳false
      因此這樣的判斷方式就可以放在while()迴圈裡做loop的判斷條件*/
      while (curDay.isBefore(dayjs(endDay).add(1, 'd'))) {
        //a.先一筆筆把的curDay轉換成星期幾
        const curWeek = curDay.format('dddd').toLocaleLowerCase();
        //b.有了幾期幾後，就可以用星期幾去對應newReducibleTime的資料，應的可預約時間實際的對應出來
        const orderTime = newReducibleTime[curWeek];
        //c.如果該星期幾有可約時，則開始進入排課
        if (orderTime && orderTime.length > 0) {
          for (const ot of orderTime) {

            /*d.在進入排課前，先檢查該時間、日期是否已經有排過了，
            因此這裡是去後端資料庫的schedule表格裡去檢查orgId、startTime、endTime、schoolDay、courseId欄位裡有找到相同資料的
            如果有，則會回傳相對應的資料，則代表可約日期有重覆己有安排過*/
            const [oldSchedule] = await this.scheduleService.findSchedules({
              where: {
                org: { id: orgId },
                startTime: ot.startTime,
                endTime: ot.endTime,
                schoolDay: curDay.toDate(),
                course: { id: course.id },
              },
              start: 0,
              length: 10,
            });

            //e.如果沒有任何己安排的課程資料回傳，則代表沒有重覆的，因為可以開始創建schedule的實例，並將把寫好的賽例儲存到到schedule的表格裡
            if (oldSchedule.length === 0) {
              const schedule = new Schedule();
              schedule.startTime = ot.startTime;
              schedule.endTime = ot.endTime;
              schedule.limitNumber = course.limitNumber;
              schedule.org = course.org;
              schedule.course = course;
              schedule.schoolDay = curDay.toDate();
              schedule.createdBy = userId;
              schedule.teacher = course.teachers[0];
              // 雖然課程再透過create建立實體，但實際上並不需要，因為已經透過new Schedule()建立實體了
              // const si = await this.scheduleService.createInstance(schedule);
              schedules.push(schedule);
            }
          }
        }
        //將日期加一天，然後繼續while()迴圈裡的循環
        curDay = curDay.add(1, 'd');
      }
    }
    const res = await this.scheduleService.batchCreate(schedules);
    if (res) {
      return {
        code: SUCCESS,
        message: `排課成功，一共幫您新增了 ${schedules.length} 堂課程。`
      };
    }
    return {
      code: SCHEDULE_CREATE_FAIL,
      message: '創建失败',
    };
  }

  // 獲取該門市某一天的已排課程資料(輸入當天日期及門市Id)
  @Query(() => ScheduleResults)
  async getSchedules(
    @Args('today') today: string,
    @CurOrgId() orgId: string,
  ): Promise<ScheduleResults> {
    const where: FindOptionsWhere<Schedule> = {
      schoolDay: dayjs(today).toDate(),
      org: { id: orgId },
    };
    const [results, total] = await this.scheduleService.findAllSchedules({
      where,
    });

    return {
      code: SUCCESS,
      data: results,
      page: {
        total,
      },
      message: '獲取成功',
    };
  }

  // 删除课程表
  @Mutation(() => Result)
  async deleteSchedule(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.scheduleService.findById(id);
    if (result) {
      const delRes = await this.scheduleService.deleteById(id, userId);
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

  //獲取當前會員(學員)的消費卡裡所關聯的可預約課程
  @Query(() => OrganizationResults, { description: '獲取當前會員(學員)的消費於裡的可預約課程' })
  async getCanSubscribeCourses(
    @CurUserId() studentId: string
  ): Promise<OrganizationResults> {
    // 1 先取得該會員(學員)它購課後，所有課程的有效消费卡
    const cards = await this.cardRecordService.findValidCards(studentId);
    if (!cards || cards.length === 0) {
      return {
        code: CARD_RECORD_EXIST,
        message: '没有可用的消费卡，快去購買吧',
      };
    }
    // 2 取得消費卡後，再從消費卡裡去把該張消費卡所關聯的課程提取出來
    const courses = cards.map((item) => item.course);
    /*3. 所提取出來的門市，可能會是同一個(例如會有台北門市的課程或是桃園門市的課程，但同一個門市會有不同對應不同消費卡)
    因此我們把重覆門市的消費卡做移除只留一個下來，可以使用lodash的uniqBy()就能達到去除重覆的資料*/
    const cs = _.uniqBy(courses, 'id');
    /*4 再把剛才去除重復門市後，所留下來的課程資料，再做一下整理，
    我們希望將課程資料整理成下面這樣的物件格式，就是另外把門市id抽出來當做物件的key，
    然後裡面的資料換作是門市+課程資料的合併，也就是再把上面的corses的資料轉換成以門市為主的分類資料
    {
      d1927f3b-8bf2-4014-8ee5-69762f7a6f31:{address:'',businessLicense:'',courses:[]}
      e0568d35-48a0-42ae-8009-3eebe6c53fd1:{address:'',businessLicense:'',courses:[]}
    }
    */
    const orgObj: Record<string, OrganizationType> = {};
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];
      if (orgObj[c.org.id]) {
        orgObj[c.org.id].courses.push(c);
      } else {
        orgObj[c.org.id] = {
          ...c.org,
          courses: [c],
        };
      }
    }
    //由於我們希輸出的資料是屬於門市(機構)的資料格式類型，所以我們將上面整理好的資料重新放入到一個OrganizationType資料格式裡
    const orgs: OrganizationType[] = Object.values(orgObj);

    return {
      code: SUCCESS,
      message: '獲取成功',
      data: orgs,
      page: {
        total: orgs.length,
      },
    };
  }

  //獲取某一個課程的近七天的程程表
  @Query(() => ScheduleResults, { description: '獲取某一某課程的近七天的程程表' })
  async getSchedulesByCourse(
    @Args('courseId') courseId: string,
  ): Promise<ScheduleResults> {
    const [entities, count] = await this.scheduleService.findValidSchedulesForNext7Days(courseId);

    return {
      code: SUCCESS,
      message: '獲取成功',
      data: entities,
      page: { total: count },
    };
  }

  // 建立預約課程 - 這裡要做的就是會員(學員)在前端選定所預約課程後的後端端接口
  @Mutation(() => Result, { description: '建立預約課程' })
  async subscribeCourse(
    @Args('scheduleId') scheduleId: string,
    @Args('cardId') cardId: string,
    @CurUserId() userId: string,
  ) {
    // 第一步：校驗是消費卡否存在 (經驗談:每寫一個後端的接口，習慣上都會做校驗，除了確該資料是否存在於資料庫，也可做一些業務邏輯的校驗)
    const myCard = await this.cardRecordService.findById(cardId);
    if (!myCard) {
      return {
        code: CARD_NOT_EXIST,
        message: '消費卡不存在',
      };
    }

    // 校驗是消費卡否過期，這邊也算是多一個防護
    if (dayjs().isAfter(myCard.endTime)) {
      return {
        code: CARD_EXPIRED,
        message: '消費卡已經過期',
      };
    }

    // 判斷消該費卡的使用次數是否耗盡
    if (myCard.card.type === CardType.TIME && myCard.residueTime === 0) {
      return {
        code: CARD_DEPLETE,
        message: '消費卡次數已經使用完畢了',
      };
    }

    // 校驗是否存在該課程
    const schedule = await this.scheduleService.findById(scheduleId);
    if (!schedule) {
      return {
        code: SCHEDULE_NOT_EXIST,
        message: '當前課程表不存在',
      };
    }

    // 校驗是否已有重覆預繼同時間段課程
    const isHadSubscribe = await this.scheduleRecordService.isHadSubscribe(
      scheduleId,
      userId,
    );
    if (isHadSubscribe) {
      return {
        code: SCHEDULE_HAD_SUBSCRIBE,
        message: '該時間段您已預約過',
      };
    }

    // 第二步：建立預约記錄
    const scheduleRecordId = await this.scheduleRecordService.create({
      subscribeTime: new Date(),
      student: { id: userId, },
      schedule: { id: scheduleId, },
      cardRecord: { id: cardId, },
      course: { id: schedule.course.id, },
      org: { id: schedule.org.id, },
    });

    if (!scheduleRecordId) {
      return {
        code: SUBSCRIBE_FAIL,
        message: '預約失敗',
      };
    }

    // 第三步 : 銷卡 - 最後若該消費卡為次卡，則扣除該卡的可約次數1次
    if (myCard.card.type === CardType.TIME) {
      const res = await this.cardRecordService.updateById(cardId, {
        residueTime: myCard.residueTime - 1,
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '預約成功',
        };
      } else {
        await this.scheduleRecordService.deleteById(scheduleRecordId, userId);
        return {
          code: SUBSCRIBE_FAIL,
          message: '預約失敗',
        };
      }
    }
    return {
      code: SUCCESS,
      message: '預约成功',
    };
  }
}
