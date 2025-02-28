import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Card } from "./models/card.entity";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";

@Injectable()
export class CardServices {
  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>
  ) { }

  //建立新資料
  async create(entity: DeepPartial<Card>): Promise<boolean> {
    const res = await this.cardRepository.save(this.cardRepository.create(entity))
    if (res) {
      return true;
    }
    return false;
  }

  //刪除
  async deleteById(id: string,): Promise<boolean> {
    const res = await this.cardRepository.delete(id) // 調用Repository的API insert
    return (res.affected > 0) ? true : false
  }

  //軟刪除
  async softDeleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.cardRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.cardRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
  }

  //更新
  async updateById(id: string, entity: DeepPartial<Card>): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.cardRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  //查詢筆單資料
  async findById(id: string,): Promise<Card> {
    const res = await this.cardRepository.findOne({
      where: {
        id,
      },
      relations: ['course', 'org'],
    })
    return res
  }

  //查詢資料 - 回傳多筆
  async find({ where }: {
    where: FindOptionsWhere<Card>
  }): Promise<[Card[], number]> {
    const res = await this.cardRepository.findAndCount({
      where,
      order: {
        createdAt: 'DESC'
      },
      relations: ['course'],
    })
    return res
  }
}