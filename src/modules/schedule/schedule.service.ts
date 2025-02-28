import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, FindOptionsWhere, Between } from 'typeorm';
import { Schedule } from './models/schedule.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) { }

  //建立排課實體(如果在resolver端有使用new Schedule()，基本上就不需要再用到這裡再建立一次)
  async createInstance(entity: DeepPartial<Schedule>): Promise<Schedule> {
    return this.scheduleRepository.create(entity);
  }

  // 建立排課資料 (從resolver那一層會傳來Schedule實體的陣列，透過save一次傳進去)
  async batchCreate(entities: Schedule[]): Promise<boolean> {
    //創建 QueryRunner，用來手動管理 Transaction。
    const queryRunner = this.scheduleRepository.manager.connection.createQueryRunner();
    //開始 Transaction，確保整個批量儲存要嘛全部成功，要嘛全部失敗並回滾。
    await queryRunner.startTransaction();

    try {
      const res = await queryRunner.manager.save(Schedule, entities);
      await queryRunner.commitTransaction(); // ✅ 成功則提交交易，代表所有資料確定寫入資料庫
      return res.length > 0;
    } catch (error) {
      await queryRunner.rollbackTransaction(); // ❌ 失敗則回滾,取消交易，讓資料庫回到執行 Transaction 之前的狀態
      console.error('批量建立排課失敗:', error);
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async create(entity: DeepPartial<Schedule>): Promise<boolean> {
    const res = await this.scheduleRepository.save(
      this.scheduleRepository.create(entity),
    );
    if (res) {
      return true;
    }
    return false;
  }

  async findById(id: string): Promise<Schedule> {
    return this.scheduleRepository.findOne({
      where: { id },
      relations: ['course', 'org'],
    });
  }

  async updateById(id: string, entity: DeepPartial<Schedule>,): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.scheduleRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  // 查某該門市某一天的已排課程資料
  async findAllSchedules({ where }: { where: FindOptionsWhere<Schedule> }): Promise<[Schedule[], number]> {

    return this.scheduleRepository.findAndCount({
      where,
      order: { startTime: 'ASC' },
      relations: [
        'course',
        'course.teachers',
        'scheduleRecords',
        'scheduleRecords.student',
      ],
    });
  }

  async findSchedules({
    start,
    length,
    where,
  }: {
    start: number;
    length: number;
    where: FindOptionsWhere<Schedule>;
  }): Promise<[Schedule[], number]> {
    return this.scheduleRepository.findAndCount({
      take: length,
      skip: start,
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.scheduleRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.scheduleRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
    return false;
  }

  // 獲取某一課程未来有效的，7天内的課程表
  async findValidSchedulesForNext7Days(courseId: string): Promise<[Schedule[], number]> {
    const res = await this.scheduleRepository.findAndCount({
      where: {
        course: { id: courseId },
        schoolDay: Between(
          dayjs().endOf('day').toDate(), //endOf('day')可以取出今日23:59:59秒的時間
          dayjs().add(7, 'day').endOf('day').toDate(),
        ),
      },
      order: {
        schoolDay: 'ASC',
        startTime: 'ASC',
      },
    });
    return res;
  }
}
