import { NOT_EMPTY, SUCCESS, VALIDATE_ERROR } from "@/common/constants/code";
import { Result } from "@/common/dto/result.type";

export const getRandomCode = () => {
  const code = [];
  for (let i = 0; i < 4; i++) {
    code.push(Math.floor(Math.random() * 9));
  }
  return code.join('');
};

/**
 * 账号和密码校验
 * 密码由于是被 MD5 加密的，所以无法校验
 * @param account 账号
 * @param password 密码
 */
export const accountAndPwdValidate = (
  account: string,
  password: string,
): Result => {
  if (!account || !password) {
    return {
      code: NOT_EMPTY,
      message: '帳號或密碼不能為空',
    };
  }
  if (!/^(?![0-9]+$)(?![a-z]+$)[a-z0-9]{6,10}$/.test(account)) {
    return {
      code: VALIDATE_ERROR,
      message: '帳號驗證失敗，請重新輸入帳號',
    };
  }
  return {
    code: SUCCESS,
    message: ""
  };
};