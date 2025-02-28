import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Student } from "./models/student.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student) private studentRepository: Repository<Student>
  ) { }

  //本詢帳號
  async findByAccount(account: string): Promise<Student> {
    return this.studentRepository.findOne({
      where: {
        account,
      },
    });
  }

  //建立新資料
  async create(entity: DeepPartial<Student>): Promise<boolean> {
    const res = await this.studentRepository.save(this.studentRepository.create(entity))
    if (res) {
      return true;
    }
    return false;
  }

  //刪除
  async deleteById(id: string,): Promise<boolean> {
    const res = await this.studentRepository.delete(id) // 調用Repository的API insert
    return (res.affected > 0) ? true : false
  }

  //軟刪除
  async softDeleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.studentRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.studentRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
  }

  //更新
  async updateById(id: string, entity: DeepPartial<Student>): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.studentRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  //查詢筆單資料
  async findById(id: string,): Promise<Student> {
    const res = await this.studentRepository.findOne({
      where: {
        id,
      }
    })
    return res
  }

  //查詢資料 - 回傳多筆
  async find({ start, length }: {
    start: number,
    length: number,
  }): Promise<[Student[], any]> {
    const res = await this.studentRepository.findAndCount({
      take: length,
      skip: start,
      order: {
        createdAt: 'DESC'
      }
    })
    return res
  }
}