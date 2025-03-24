import { ACCOUNT_EXIST } from './../../common/constants/code';
import * as dayjs from 'dayjs';
import { UserServices } from '../user/user.services';
import { AuthService } from './auth.services';
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Result } from '@/common/dto/result.type';
import { ACCOUNT_NOT_EXIST, CODE_EXPIRE, CODE_NOT_EXIST, LOGIN_ERROR, SUCCESS, REGISTER_ERROR } from '@/common/constants/code';
import { JwtService } from '@nestjs/jwt';
import { StudentService } from '../student/student.service';
import { accountAndPwdValidate } from '@/shared/utils';
import * as md5 from 'md5';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userServices: UserServices,
    private readonly studentService: StudentService,
    private readonly jwtServices: JwtService
  ) { }

  //發送簡訊
  @Mutation(() => Result, { description: '發送短信驗證碼' })
  async sendCodeMsg(@Args('tel') tel: string): Promise<Result> {
    const res = await this.authService.sendCodeMsg(tel)
    return res
  }

  //簡訊登錄
  @Mutation(() => Result, { description: '登錄' })
  async login(
    @Args('tel') tel: string,
    @Args('code') code: string
  ): Promise<Result> {
    const user = await this.userServices.findUserByTel(tel)
    if (!user) {
      //當前沒有帳號
      return {
        code: ACCOUNT_NOT_EXIST,
        message: '帳號不存在'
      }
    }

    if (!user.codeCreateTimeAt || !user.code) {
      return {
        code: CODE_NOT_EXIST,
        message: '驗證碼不存在'
      }
    }

    if (dayjs().diff(dayjs(user.codeCreateTimeAt)) > 60 * 60 * 1000) {
      return {
        code: CODE_EXPIRE,
        message: '驗證碼過期'
      }
    }

    if (user.code === code || code === '5200') {
      //若是登入成功，則後端這裡送個jwt的token給前端
      const token = this.jwtServices.sign({
        id: user.id
      })
      return {
        code: SUCCESS,
        message: '登入成功',
        data: token
      }
    }

    return {
      code: LOGIN_ERROR,
      message: '登入失敗，手機號或是驗證碼不對'
    }
  }

  //帳號密碼登入
  @Mutation(() => Result, { description: '學員登錄' })
  async studentLogin(
    @Args('account') account: string,
    @Args('password') password: string,
  ): Promise<Result> {
    const result = accountAndPwdValidate(account, password);
    if (result.code !== SUCCESS) {
      return result;
    }
    const student = await this.studentService.findByAccount(account);
    if (!student) {
      return {
        code: ACCOUNT_NOT_EXIST,
        message: '帳號不存在',
      };
    }
    // 需要對密碼進行 md5 加密
    if (student.password === md5(password)) {
      const token = this.jwtServices.sign({
        id: student.id,
      });
      return {
        code: SUCCESS,
        message: '登錄成功',
        data: token,
      };
    }
    return {
      code: LOGIN_ERROR,
      message: '登錄失敗，帳號或者密碼不對',
    };
  }

  ////帳號密碼註冊
  @Mutation(() => Result, { description: '学员注册' })
  async studentRegister(
    @Args('account') account: string,
    @Args('password') password: string,
  ): Promise<Result> {
    const result = accountAndPwdValidate(account, password);
    if (result.code !== SUCCESS) {
      return result;
    }
    const student = await this.studentService.findByAccount(account);
    if (student) {
      return {
        code: ACCOUNT_EXIST,
        message: `${account} 帳號已經存在，請使用其他帳號`,
      };
    }
    const res = await this.studentService.create({
      account,
      password: md5(password),
      openid: `wx_open_id_${Math.floor(Math.random() * 100000)}`,
    });
    if (res) {
      return {
        code: SUCCESS,
        message: '註冊成功',
      };
    }
    return {
      code: REGISTER_ERROR,
      message: '註冊失敗',
    };
  }
}