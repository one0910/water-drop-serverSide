import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      //1.指定如何從Request中提取 JWT，也就是從從 Authorization: Bearer <token> 中提取 Token。
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //2.驗證 JWT 簽名的密鑰
      secretOrKey: process.env.JWT_SECRET
    });
  }
  //3.上面的JWT token驗證成功後，透過validate()將payload附加到req.user裡
  async validate(user: any): Promise<any> {
    if (!user.id) {
      throw new UnauthorizedException();
    }
    return user;
  }
}