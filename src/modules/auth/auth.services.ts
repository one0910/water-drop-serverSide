import { getRandomCode } from "@/shared/utils";
import { Injectable } from "@nestjs/common";
import { UserServices } from '../user/user.services';
import * as dayjs from "dayjs";
import { Result } from "@/common/dto/result.type";
import { CODE_NOT_EXPIRE, SUCCESS, UPDATE_ERROR } from "@/common/constants/code";

@Injectable()

export class AuthService {
  //發送短信代碼
  constructor(private readonly userService: UserServices) { }

  async sendCodeMsg(tel: string): Promise<Result> {
    const user = await this.userService.findUserByTel(tel)
    const code = getRandomCode()
    if (user) {
      /**
       *這裡的diffTime作用是用來比較目前時間及用戶上次發送訊息時間的比較,我們希望1分鐘內不要重覆傳送2次
       *利用dayjs裡的diff功能，可以用來比較目前時間及給定的時間差
      */
      const diffTime = dayjs().diff(dayjs(user.codeCreateTimeAt))
      if (diffTime < 60 * 1000) {
        return {
          code: CODE_NOT_EXPIRE,
          message: '驗證碼尚未過期'
        }
      }

      //若是舊的電話號碼，則更新驗證碼
      const result = await this.userService.updateUserCode(user.id, code)
      if (result) {
        return {
          code: SUCCESS,
          message: '獲取驗證碼成功',
          returnCode: code
        }
      } else {
        return {
          code: UPDATE_ERROR,
          message: '獲取驗證失敗'
        }
      }
    } else {


      // 若是新的電話號碼，則建立新用戶
      const result = await this.userService.addUser({ tel, code, codeCreateTimeAt: new Date })
      if (result) {
        return {
          code: SUCCESS,
          message: '獲取驗證碼成功',
          returnCode: code
        }
      } else {
        return {
          code: UPDATE_ERROR,
          message: '獲取驗證碼失敗'
        }
      }
    }
  }
}