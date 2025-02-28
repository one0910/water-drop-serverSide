import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Organization } from "./models/organization.entity";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";

@Injectable()
export class OrganizationServices {
  constructor(
    @InjectRepository(Organization) private organizationRepository: Repository<Organization>
  ) { }
  /**
    * 建立一個門店
    * @param entity
    * @return
  */
  async create(entity: DeepPartial<Organization>): Promise<boolean> {
    const res = await this.organizationRepository.save(this.organizationRepository.create(entity))
    /*這裡的return 會再傳回去給引用它的controller*/
    return (res) ? true : false
  }

  async findById(id: string,): Promise<Organization> {
    const res = await this.organizationRepository.findOne({
      where: {
        id,
      },
      relations: ['orgFrontImg', 'orgRoomImg', 'orgOtherImg']
    })
    return res
  }

  async updateById(id: string, entity: DeepPartial<Organization>): Promise<boolean> {
    const existEntity = await this.findById(id)
    if (!existEntity) {
      return false
    }
    Object.assign(existEntity, entity)
    const res = await this.organizationRepository.save(existEntity) // 調用Repository的API insert
    return (res) ? true : false
  }


  async deleteById(id: string, userId: string): Promise<boolean> {
    //這更的更新主要是要標示是哪位使用者做刪除的
    const res = await this.organizationRepository.update(id, {
      deletedBy: userId
    })
    //標示完刪除的使用者後，這裡做一個軟刪除，實際上並沒有刪除資料庫的裡的資料，而是在deleteAt裡標示刪除的時間
    if (res) {
      const res = await this.organizationRepository.softDelete(id) // 調用Repository的API insert
      if (res.affected > 0) {
        return true
      }
    }
    return false
  }

  async findOrganizations({
    start,
    length,
    where,
  }: {
    start: number;
    length: number;
    where: FindOptionsWhere<Organization>;
  }): Promise<[Organization[], number]> {
    const res = this.organizationRepository.findAndCount({
      take: length,
      skip: start,
      order: {
        createdAt: 'DESC',
      },
      where,
      relations: ['orgFrontImg', 'orgRoomImg', 'orgOtherImg'],
    });
    return res
  }

  //透過聯絡電話查詢用戶資料
  async findOrganizationByTel(tel: string,): Promise<Organization> {
    const res = await this.organizationRepository.findOne({
      where: {
        tel,
      }
    }) // 調用Repository的API insert
    return res
    // return (res.affected > 0) ? true : false
  }

}