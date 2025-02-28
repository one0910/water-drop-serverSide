import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./models/product.entity";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import { ProductStatus } from "@/common/constants/enmu";

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>
  ) { }

  //建立新資料
  async create(entity: DeepPartial<Product>): Promise<boolean> {
    const res = await this.productRepository.save(this.productRepository.create(entity))
    if (res) {
      return true;
    }
    return false;
  }

  //刪除
  async deleteById(id: string,): Promise<boolean> {
    const res = await this.productRepository.delete(id) // 調用Repository的API insert
    return (res.affected > 0) ? true : false
  }

  //軟刪除
  async softDeleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.productRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.productRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
  }

  //更新
  async updateById(id: string, entity: DeepPartial<Product>): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.productRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  //查詢商品筆數 - 進來的options條件有類型及搜尋名
  async getCount(options) {
    return this.productRepository.count(options);
  }

  //查詢筆單資料
  async findById(id: string,): Promise<Product> {
    const res = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: ['org', 'cards', 'cards.course'],
    })
    return res
  }

  //查詢資料 - 回傳多筆
  async find({ start, length, where }: {
    start: number,
    length: number,
    where: FindOptionsWhere<Product>
  }): Promise<[Product[], any]> {
    const res = await this.productRepository.findAndCount({
      take: length,
      skip: start,
      where,
      order: {
        createdAt: 'DESC'
      },
      relations: ['org']
    })
    return res
  }

  //按照座標距離排序
  async findProductsOrderByDistance({ start, length, where, position }: {
    start: number;
    length: number;
    where: FindOptionsWhere<Product>;
    position: {
      latitude: number;
      longitude: number;
    };
  }): Promise<{ entities: Product[]; raw: any[] }> {
    const res = this.productRepository.createQueryBuilder('product')
      .select('product')
      .addSelect(
        `
        ST_Distance(ST_GeomFromText('POINT(${position.latitude} ${position.longitude})', 4326), 
        ST_GeomFromText(CONCAT('POINT(', organization.latitude, ' ', organization.longitude, ')'), 4326))
      `,
        'distance'
      )
      .innerJoinAndSelect('product.org', 'organization')
      .where(`product.status = '${ProductStatus.LIST}'`)
      .andWhere(`product.name LIKE '%${where.name || ''}%'`)
      .andWhere(where.type ? `product.type = '${where.type}'` : '1=1')
      .orderBy('distance', 'ASC')
      .take(length)
      .skip(start)
      .getRawAndEntities();
    return res
  }

  async findProducts({ start, length, where }: {
    start: number;
    length: number;
    where: FindOptionsWhere<Product>;
  }): Promise<[Product[], number]> {
    return this.productRepository.findAndCount({
      take: length,
      skip: start,
      where,
      order: {
        createdAt: 'DESC',
      },
      relations: ['org'],
    });
  }
}