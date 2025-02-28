import { Organization } from '@/modules/organization/models/organization.entity';
import { ORG_NOT_EXIST, ORG_FAIL, ORG_DEL_FAIL } from '@/common/constants/code';
import { REGISTER_ERROR } from '@/common/constants/code';
import { PageInput } from '@/common/dto/page.input';
import { OrganizationResult, OrganizationResults } from './dto/result-organization.output';
import { SUCCESS, UPDATE_ERROR } from '@/common/constants/code';
import { Result } from '@/common/dto/result.type';
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/auth.guards";
import { CurUserId } from '@/common/decorators/current-user.decorator';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrganizationServices } from "./organization.services";
import { OrganizationInput } from "./dto/organization.input";
import { OrganizationType } from "./dto/organization.type";
import { OrgImageService } from '../orgImage/orgImage.service';
import { FindOptionsWhere, Like } from 'typeorm';

@UseGuards(GqlAuthGuard)
@Resolver()
export class OrganizationResolver {
  constructor(
    private readonly organizationService: OrganizationServices,
    private readonly orgImageService: OrgImageService
  ) { }

  @Query(() => OrganizationResult)
  async getOrganizationInfo(@Args('id') id: string): Promise<OrganizationResult> {
    const res = await this.organizationService.findById(id)
    if (res) {
      return {
        code: SUCCESS,
        data: res,
        message: '獲取成功',
      };
    }
    return {
      code: ORG_NOT_EXIST,
      message: '門店信息不存在',
    };
  }

  //新增用戶資料
  @Mutation(() => OrganizationResult, { description: '新增用戶' })
  async create(@Args('params') params: OrganizationInput): Promise<OrganizationResult> {

    const res = await this.organizationService.create(params)
    if (res) {
      return {
        code: SUCCESS,
        message: '註冊成功',
      };
    } else {
      return {
        code: REGISTER_ERROR,
        message: '註冊失敗',
      };
    }
  }

  //查詢某一筆的門市(機構)資料
  @Query(() => OrganizationType, { description: '使用ID查詢門市(機構)料' })
  async find(@Args('id') id: string): Promise<OrganizationType> {
    const res = await this.organizationService.findById(id)
    return res
  }

  //獲取多筆門市(機構)資料
  @Query(() => OrganizationResults)
  async getOrganizations(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<OrganizationResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<Organization> = { createdBy: userId };
    if (name) {
      // Like 是typeorm提供的一種模糊搜索的方法
      where.name = Like(`%${name}%`);
    }
    const [results, total] = await this.organizationService.findOrganizations({
      start: (pageNum - 1) * pageSize,
      length: pageSize,
      where,
    });
    return {
      code: SUCCESS,
      data: results,
      page: {
        pageNum,
        pageSize,
        total,
      },
      message: '獲取成功',
    };
  }

  //更新用戶資料
  @Mutation(() => Result, { description: '更新門市資料' })
  async updateOrganizationInfo(
    @Args('id') id: string,
    @Args('params') params: OrganizationInput
  ): Promise<Result> {
    const res = await this.organizationService.updateById(id, params)
    if (res) {
      return {
        code: SUCCESS,
        message: '更新成功'
      }
    }
    return {
      code: UPDATE_ERROR,
      message: '更新失敗'
    }
  }

  //刪除門市(機構)資料
  @Mutation(() => Result, { description: '刪除一個門市' })
  async deleteOrganization(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    //1.先確認該門市是否存在
    const result = await this.organizationService.findById(id);
    //2.門市存在，再進行刪除
    if (result) {
      const delRes = await this.organizationService.deleteById(id, userId);
      if (delRes) {
        return {
          code: SUCCESS,
          message: '刪除成功'
        }
      } else {
        return {
          code: ORG_DEL_FAIL,
          message: '删除失败',
        };
      }
    }
    return {
      code: ORG_NOT_EXIST,
      message: '門市信息不存在',
    }

  }


  //建立或是更新門市(機構)資料
  @Mutation(() => OrganizationResult)
  async commitOrganization(
    @Args('params') params: OrganizationInput,
    @CurUserId() userId: string,
    @Args('id', { nullable: true }) id?: string,
  ): Promise<Result> {
    //1.如果有帶門市id進來，則進行更新
    if (id) {
      const organization = await this.organizationService.findById(id);
      if (!organization) {
        return {
          code: ORG_NOT_EXIST,
          message: '門店信息不存在',
        };
      }

      /**
      由於資料庫在更新陣列資料時，它不會將其資料刪除，而是將資料再累加，
      對於organization來說，orgImage是為1對多的陣列資料(為了允許它可以多個圖片)，
      這邊會有個情況是更新完資料後，會有多的冗餘的資料出來
      因此在進行更新前，先把organization所對應的orgImage資料庫裡的資料先全部刪除，然後再來行更新
      */
      const delRes = await this.orgImageService.deleteByOrg(id);
      if (!delRes) {
        return {
          code: ORG_FAIL,
          message: '圖片删除不成功，無法更新門店信息',
        };
      }

      const res = await this.organizationService.updateById(id, {
        ...params,
        updatedBy: userId
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '更新成功',
        };
      }
    }

    //2.若是沒有門市id，則建立新的門市
    const res = await this.organizationService.create({
      ...params,
      createdBy: userId,
    });

    //3.最後返迴結果
    if (res) {
      return {
        code: SUCCESS,
        message: '創建建成功',
      };
    }
    return {
      code: ORG_FAIL,
      message: '操作失敗',
    };

  }

}