import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, FindOptionsWhere } from 'typeorm';
import { ScheduleRecord } from './models/schedule-record.entity';
@Injectable()
export class ScheduleRecordService {
  constructor(
    @InjectRepository(ScheduleRecord)
    private readonly scheduleRecordRepository: Repository<ScheduleRecord>,
  ) { }

  async create(entity: DeepPartial<ScheduleRecord>): Promise<string> {
    const res = await this.scheduleRecordRepository.save(
      this.scheduleRecordRepository.create(entity),
    );
    if (res) {
      return res.id;
    }
    return '';
  }

  async findById(id: string): Promise<ScheduleRecord> {
    return this.scheduleRecordRepository.findOne({
      where: {
        id,
      },
      relations: ['schedule', 'cardRecord'],
    });
  }

  async updateById(id: string, entity: DeepPartial<ScheduleRecord>,): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.scheduleRecordRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  //查詢schedule_record table裡某會員(學員)的已預約課程資料
  async findScheduleRecords({ start, length, where, }: {
    start: number;
    length: number;
    where: FindOptionsWhere<ScheduleRecord>;
  }): Promise<[ScheduleRecord[], number]> {
    return this.scheduleRecordRepository.findAndCount({
      take: length,
      skip: start,
      where,
      order: {
        subscribeTime: 'DESC',
      },
      relations: ['schedule', 'course', 'org', 'schedule.teacher'],
    });
  }

  // 判断當前所選擇的課程時間段是否已被預約了
  async isHadSubscribe(scheduleId: string, userId: string): Promise<boolean> {
    const res = await this.scheduleRecordRepository.findBy({
      schedule: { id: scheduleId, },
      student: { id: userId, },
    });
    if (res.length > 0) {
      return true;
    }
    return false;
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.scheduleRecordRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.scheduleRecordRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
    return false;
  }
}
