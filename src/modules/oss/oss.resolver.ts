import { Query, Resolver } from "@nestjs/graphql";
import { OSSServices } from './oss.services';
import { OSSType } from "./dto/oss.type";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/auth.guards";

@Resolver()
// @UseGuards(GqlAuthGuard)
export class OSSResolver {
  constructor(private readonly ossService: OSSServices) { }

  //查詢用戶資料
  @Query(() => OSSType, { description: '取得OSS相關訊息' })
  async getOSSInfo(): Promise<OSSType> {
    const res = await this.ossService.getSignature()
    return res
  }
}