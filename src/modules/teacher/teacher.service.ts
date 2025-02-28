import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, FindOptionsWhere } from 'typeorm';
import { Teacher } from './models/teacher.entity';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher) private teacherRepository: Repository<Teacher>
  ) { }

  //建立新資料
  async create(entity: DeepPartial<Teacher>): Promise<boolean> {
    const res = await this.teacherRepository.save(this.teacherRepository.create(entity))
    if (res) {
      return true;
    }
    return false;
  }

  //刪除
  async deleteById(id: string,): Promise<boolean> {
    const res = await this.teacherRepository.delete(id) // 調用Repository的API insert
    return (res.affected > 0) ? true : false
  }

  //軟刪除
  async softDeleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.teacherRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.teacherRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
  }

  //更新
  async updateById(id: string, entity: DeepPartial<Teacher>): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.teacherRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  //查詢筆單資料
  async findById(id: string,): Promise<Teacher> {
    const res = await this.teacherRepository.findOne({
      where: {
        id,
      }
    })
    return res
  }

  //查詢資料 - 回傳多筆
  async find({ start, length, where }: {
    start: number,
    length: number,
    where: FindOptionsWhere<Teacher>
  }): Promise<[Teacher[], any]> {
    const res = await this.teacherRepository.findAndCount({
      take: length,
      skip: start,
      where,
      order: {
        createdAt: 'DESC'
      }
    })
    return res
  }
}