import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Course } from "./models/course.entity";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";

@Injectable()
export class CourseServices {
  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>
  ) { }

  //建立新資料
  async create(entity: DeepPartial<Course>): Promise<boolean> {
    const res = await this.courseRepository.save(this.courseRepository.create(entity))
    if (res) {
      return true;
    }
    return false;
  }

  //查詢筆單資料
  async findById(id: string,): Promise<Course> {
    const res = await this.courseRepository.findOne({
      where: { id },
      relations: ['teachers']
    })
    return res
  }

  //查詢資料 - 回傳多筆
  async find({ start, length, where }: {
    start: number,
    length: number,
    where: FindOptionsWhere<Course>;
  }): Promise<[Course[], any]> {
    const res = await this.courseRepository.findAndCount({
      take: length,
      skip: start,
      where,
      order: { createdAt: 'DESC' },
      relations: ['org', 'teachers'],
    })
    return res
  }


  //更新資料
  async updateById(id: string, entity: DeepPartial<Course>): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.courseRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  //軟刪除
  async softDeleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.courseRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.courseRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
  }



}