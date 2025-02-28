import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgImage } from './models/orgImage.entity';
import { Repository } from 'typeorm';

/**
  *這支程式的目的就是希望再更新資料前，先把organization所對應的orgImage資料庫裡的資料先全部刪除
   若不是這樣做，會造成更新時會有多的冗餘的資料出來，因為陣列無法整個更新，而是是將資料再累加
*/

@Injectable()
export class OrgImageService {
  constructor(
    @InjectRepository(OrgImage)
    private readonly orgImageRepository: Repository<OrgImage>,
  ) { }

  async deleteByOrg(id): Promise<boolean> {
    //1.查詢 OrgImage 資料表，找到與 id 相匹配的圖片記錄。條件包括 orgIdForFrontId, orgIdForRoomId, 或 orgIdForOtherId。
    const imgs = await this.orgImageRepository
      .createQueryBuilder('orgImage')
      .where(`orgImage.orgIdForFrontId = '${id}'`)
      .orWhere(`orgImage.orgIdForRoomId = '${id}'`)
      .orWhere(`orgImage.orgIdForOtherId = '${id}'`)
      .getMany();

    //2.如果沒有找到OrgImage資料表的匹配記錄，直接返回 true
    if (imgs.length === 0) {
      return true;
    }

    //3.若是有找到匹配的OrgImage資料表的記錄，則進行刪除找到的記錄
    const delResult = await this.orgImageRepository.delete(
      imgs.map((item) => {
        return item.id
      }),
    );
    //4.如果成功刪除，則返回true
    if (delResult.affected > 0) {
      return true;
    }
    return false;
  }
}
