import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./models/order.entity";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import { OrderStatus } from "@/common/constants/enmu";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>
  ) { }

  //建立新資料
  async create(entity: DeepPartial<Order>): Promise<boolean> {
    const res = await this.orderRepository.save(this.orderRepository.create(entity))
    if (res) {
      return true;
    }
    return false;
  }

  //刪除
  async deleteById(id: string,): Promise<boolean> {
    const res = await this.orderRepository.delete(id) // 調用Repository的API insert
    return (res.affected > 0) ? true : false
  }

  //軟刪除
  async softDeleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.orderRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.orderRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
  }

  //更新
  async updateById(id: string, entity: DeepPartial<Order>): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }

    Object.assign(existEntity, entity);
    const res = await this.orderRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  //取得會員(學員)已購買某課程(商品)的資訊(已經支付成功的)
  async findByStudentAndProduct(studentId: string, productId: string, orgId: string): Promise<Order[]> {
    return this.orderRepository.findBy({
      status: OrderStatus.SUCCESS,
      student: {
        id: studentId,
      },
      product: {
        id: productId,
      },
      org: {
        id: orgId,
      },
    });
  }

  //透過微信支付訂單號(outTradeNo)來查詢訂筆單單資料
  async findByOutTradeNo(outTradeNo: string): Promise<Order> {
    return this.orderRepository.findOne({
      where: {
        outTradeNo,
      },
      relations: ['org', 'product', 'student', 'wxOrder']
    });
  }

  //查詢筆單資料
  async findById(id: string,): Promise<Order> {
    const res = await this.orderRepository.findOne({
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
    where: FindOptionsWhere<Order>
  }): Promise<[Order[], any]> {
    const res = await this.orderRepository.findAndCount({
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