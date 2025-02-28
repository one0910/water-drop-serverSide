import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Wxorder } from "./models/wxorder.entity";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";

@Injectable()
export class WxorderService {
  constructor(
    @InjectRepository(Wxorder) private wxorderRepository: Repository<Wxorder>
  ) { }

  //建立新資料
  async create(entity: DeepPartial<Wxorder>): Promise<Wxorder> {
    const res = await this.wxorderRepository.save(this.wxorderRepository.create(entity))
    return res
  }

  //刪除
  async deleteById(id: string,): Promise<boolean> {
    const res = await this.wxorderRepository.delete(id) // 調用Repository的API insert
    return (res.affected > 0) ? true : false
  }

  //軟刪除
  async softDeleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.wxorderRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.wxorderRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
  }

  //更新
  async updateById(id: string, entity: DeepPartial<Wxorder>): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.wxorderRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  //查詢筆單資料
  async findById(id: string,): Promise<Wxorder> {
    const res = await this.wxorderRepository.findOne({
      where: {
        id,
      }
    })
    return res
  }

  //透過微信支付訂單號來查詢資料
  async findByTransactionId(transactionId: string): Promise<Wxorder> {
    return this.wxorderRepository.findOne({
      where: {
        transaction_id: transactionId,
      },
    });
  }

  //查詢資料 - 回傳多筆
  async find({ start, length, where }: {
    start: number,
    length: number,
    where: FindOptionsWhere<Wxorder>
  }): Promise<[Wxorder[], any]> {
    const res = await this.wxorderRepository.findAndCount({
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