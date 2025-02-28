import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./models/user.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable() /*UserServices作為一個實體 ,透過@Injectable()這個修飾器，
允許我們所建立的實體整個都註冊到整個系統的IoC容器（Inversion of Control Container）
簡單講就是將我們所建立的註冊類別的概念
*/
export class UserServices {
  constructor(
    @InjectRepository(User) private UserRepository: Repository<User>
  ) { } /*
    1.@InjectRepository(User) 的作用是注入User實體，建立User Table的專屬數據庫操作工具庫
    2. private 是一個存取修飾符語法，除了用來定義類別的私有屬性，它在這裡(NestJS的存構裡)它還能自動宣告與賦值，
    以這裡為例，它在這宣告了變數UserRepository並賦予它為user的Repository庫，
    所以當我們在建立create的Function時，可以透過this來使用它,如下所示就可以使用Repository的inser API
  */

  /*所以上面在我們注入依賴並宣告repository後，就可以來開始撰寫資料庫的使用邏輯了，
  下面entity的參數引用了DeepPartial的type，它是一個工具類型的type，它方便的將我們所引用的User屬性都變可選狀態，
  也就是它讓我們不一定要要所的屬性都輸入，就像我們的User entity裡的id是必傳屬性，它用了DeepPartial後就可以選擇是否要傳送，
  是一個滿方便的工具型type*/

  //新增用戶
  async addUser(entity: DeepPartial<User>): Promise<boolean> {
    // const res = await this.UserRepository.insert(entity)
    /**
     這裡原本是用insert的方式將資料給寫進資料庫，但insert並不會自動加入createAt及updateAt時間欄位
     ，所以我們改用save()的方法，使用save方法它會直接回傳創建完後的entity物件
     */
    const res = await this.UserRepository.save(this.UserRepository.create(entity))
    /*這裡的return 會再傳回去給引用它的controller*/
    return (res) ? true : false
  }

  //刪除用戶
  async deleteUser(id: string): Promise<boolean> {
    const res = await this.UserRepository.delete(id) // 調用Repository的API insert
    return (res.affected > 0) ? true : false
  }

  //更新用戶
  async updateUser(id: string, entity: DeepPartial<User>): Promise<boolean> {
    const res = await this.UserRepository.update(id, entity) // 調用Repository的API insert
    return (res.affected > 0) ? true : false
  }

  //查詢用戶資料
  async findUser(id: string,): Promise<User> {
    const res = await this.UserRepository.findOne({
      where: {
        id,
      }
    }) // 調用Repository的API insert
    return res
    // return (res.affected > 0) ? true : false
  }

  //查詢用戶多筆資料
  async findUsers({ start, length }: { start: number, length: number }): Promise<[User[], any]> {
    const res = await this.UserRepository.findAndCount({
      take: length,
      skip: start,
      order: {
        createdAt: 'DESC'
      }
    })
    return res
  }

  //透過聯絡電話查詢用戶資料
  async findUserByTel(tel: string,): Promise<User> {
    const res = await this.UserRepository.findOne({
      where: {
        tel,
      }
    }) // 調用Repository的API insert
    return res
    // return (res.affected > 0) ? true : false
  }

  //更新用戶驗證碼
  async updateUserCode(id: string, code: string): Promise<boolean> {
    const res = await this.UserRepository.update(id, { code, codeCreateTimeAt: new Date }) // 調用Repository的API insert
    return (res.affected > 0) ? true : false
  }

}