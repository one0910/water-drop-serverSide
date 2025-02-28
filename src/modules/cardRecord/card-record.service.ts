import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { CardRecord } from './models/card-record.entity';
import * as dayjs from 'dayjs';
import { StudentService } from '../student/student.service';
import { CardType } from '@/common/constants/enmu';
import { CardServices } from '../card/card.services';

@Injectable()
export class CardRecordService {
  constructor(
    @InjectRepository(CardRecord)
    private readonly cardRecordRepository: Repository<CardRecord>,
    private readonly cardService: CardServices,
    private readonly studentService: StudentService,
  ) { }

  // 给會員(學員)添加多張消费卡
  async addCardForStudent(studentId: string, cardIds: string[],): Promise<boolean> {
    const crs = [];
    //遍歷所有帶來的綁定消費卡，並建立每一筆的實體，然後寫入資料庫
    for (let i = 0; i < cardIds.length; i++) {
      const cardId = cardIds[i];
      const card = await this.cardService.findById(cardId);
      const student = await this.studentService.findById(studentId);
      const cardRecord = new CardRecord();
      cardRecord.buyTime = dayjs().toDate();
      cardRecord.startTime = dayjs().toDate(); // 自定义 T+1
      cardRecord.endTime = dayjs().add(card.validityDay, 'd').toDate();
      cardRecord.residueTime = card.time;
      cardRecord.card = card;
      cardRecord.student = student;
      cardRecord.course = card.course;
      cardRecord.org = card.org;
      crs.push(cardRecord);
    }
    // 將上面建立好的消費卡實體寫入到資料庫
    const res = await this.cardRecordRepository.save(crs);
    if (res) {
      return true;
    }
    return false;
  }

  //新增
  async create(entity: DeepPartial<CardRecord>): Promise<boolean> {
    const res = await this.cardRecordRepository.save(
      this.cardRecordRepository.create(entity),
    );
    if (res) {
      return true;
    }
    return false;
  }

  //查詢某張已購商品(課程)關聯的消費卡資料
  async findById(id: string): Promise<CardRecord> {
    const res = await this.cardRecordRepository.findOne({
      where: { id },
      relations: ['card'],
    });
    return res
  }

  //更新已購商品(課程)關聯的消費卡資料
  async updateById(
    id: string,
    entity: DeepPartial<CardRecord>,
  ): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.cardRecordRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  //查詢所有已購商品(課程)關聯的消費卡資料
  async findCardRecords({ start, length, where }: {
    start: number;
    length: number;
    where: FindOptionsWhere<CardRecord>;
  }): Promise<[CardRecord[], number]> {
    return this.cardRecordRepository.findAndCount({
      take: length,
      skip: start,
      where,
      order: {
        createdAt: 'DESC',
      },
      relations: ['org', 'card'],
    });
  }

  //軟刪除某張已購商品(課程)關聯的消費卡資料
  async deleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.cardRecordRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.cardRecordRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
    return false;
  }

  // 查詢該會員(學員)的有效的消費卡資料
  async findValidCards(studentId: string): Promise<CardRecord[]> {
    const options: FindManyOptions<CardRecord> = {
      where: {
        student: { id: studentId },
      },
      relations: ['card', 'course', 'course.org', 'course.teachers'],
      order: {
        createdAt: 'DESC',
      },
    };
    const [res] = await this.cardRecordRepository.findAndCount(options);
    const data: CardRecord[] = [];
    res.forEach((item) => {
      // 先判斷是否過期，使用dayjs裡的isBefore()方法，可以用來確定endTime是否有超過目前的真實時間
      if (dayjs().isBefore(item.endTime)) {
        // 如果消費卡類型為"次數卡"的話，還需要判斷它剩餘的可預約次數是否為0，如果不為0，再將資料放進data裡
        if (!(item.card.type === CardType.TIME && item.residueTime === 0)) {
          data.push(item);
        }
      }
    });
    return data;
  }

  // 查詢某個會員(學員)可用的消费卡
  async findUseCards(studentId: string, courseId: string): Promise<[CardRecord[], number]> {
    const [cards] = await this.cardRecordRepository.findAndCount({
      where: {
        student: { id: studentId },
        course: { id: courseId },
      },
      relations: ['card'],
    });

    const newCards = [];
    cards.forEach((card) => {
      // 先確認消費卡有無過期
      if (!dayjs().isAfter(card.endTime)) {
        // 若無過期，且是時長卡
        if (card.card.type === CardType.DURATION) {
          newCards.push(card);
        }
        // 若無過期，且是次卡，同時還有剩餘次數
        if (card.card.type === CardType.TIME && card.residueTime > 0) {
          newCards.push(card);
        }
      }
    });

    return [newCards, newCards.length];
  }
}
