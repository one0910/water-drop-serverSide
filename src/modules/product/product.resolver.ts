import { PRODUCT_CREATE_FAIL, PRODUCT_DEL_FAIL, PRODUCT_NOT_EXIST, PRODUCT_UPDATE_FAIL, REGISTER_ERROR, STUDENT_NOT_EXIST } from '@/common/constants/code';
import { ProductResult, ProductResults, ProductTypesResults } from './dto/result-product.output';
import { PartialProductInput } from "./dto/product.input";
import { SUCCESS } from '@/common/constants/code';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ProductService } from "./product.service";
import { PageInput } from '@/common/dto/page.input';
import { Result } from '@/common/dto/result.type';
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/auth.guards";
import { CurUserId } from '@/common/decorators/current-user.decorator';
import { FindOptionsWhere, Like } from 'typeorm';
import { Product } from './models/product.entity';
import { CurOrgId } from '@/common/decorators/current-org.decorator';
import { PRODUCT_TYPES } from '@/common/constants/product-types';
import { ProductStatus } from '@/common/constants/enmu';

@UseGuards(GqlAuthGuard)
@Resolver()
export class ProductResolver {
  constructor(private readonly productService: ProductService) { }

  //建立或更新資料
  @Mutation(() => ProductResult, { description: '新增商品資料' })
  async commitProductInfo(
    @Args('params') params: PartialProductInput,
    @CurUserId() userId: string,
    @CurOrgId() orgId: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<ProductResult> {
    //建立新的消費卡
    if (!id) {
      const res = await this.productService.create({
        ...params,
        createdBy: userId,
        status: ProductStatus.LIST,
        // 目前庫存數量就等於新建立課程的總庫存數量
        curStock: params.stock,
        cards: [],
        org: {
          id: orgId,
        }
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '新增成功',
        };
      }
      return {
        code: PRODUCT_CREATE_FAIL,
        message: '新增失敗',
      };
    }

    //在既有的課程(商品)上綁定消費卡
    const product = await this.productService.findById(id)
    if (product) {
      const newProduct = {
        ...params,
        cards: [],
        updatedBy: userId,
      };
      //從前端送進來的綁定消費卡資料至少需要1筆
      if (params.cards && params.cards?.length > 0) {
        newProduct.cards = params.cards.map((item) => ({
          id: item,
        }));
        //從前端送進來的綁定消費卡資料若是0筆
      } else {
        // 防止消費卡被清空
        newProduct.cards = product.cards;
      }
      const res = await this.productService.updateById(product.id, newProduct);
      if (res) {
        return {
          code: SUCCESS,
          message: '更新成功',
        };
      }
      return {
        code: PRODUCT_UPDATE_FAIL,
        message: '更新失敗',
      };
    }
    return {
      code: PRODUCT_NOT_EXIST,
      message: '商品不存在',
    };
  }

  //獲取某筆詳細資料
  @Query(() => ProductResult, { description: '使用ID查詢用戶資料' })
  async getProductInfo(
    @Args('id') id: string,
  ): Promise<ProductResult> {
    const result = await this.productService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '獲取成功',
      };
    }
    return {
      code: PRODUCT_NOT_EXIST,
      message: '課程信息不存在',
    };
  }

  //獲取商品筆數的資料
  @Query(() => ProductResults, { description: '獲取商品筆數的資料' })
  async getProducts(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
    @CurOrgId() orgId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<ProductResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<Product> = { createdBy: userId };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (orgId) {
      where.org = {
        id: orgId,
      };
    }
    const [results, total] = await this.productService.find({
      start: (pageNum - 1) * pageSize,
      length: pageSize,
      where,
    })

    if (true) {
      return {
        code: SUCCESS,
        data: results,
        page: {
          pageNum,
          pageSize,
          total
        },
        message: '獲取成功',
      }
    }
  }

  //軟刪除商品資料
  @Mutation(() => Result, { description: '軟刪除商品資料' })
  async softDeleteProduct(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.productService.findById(id);
    if (result) {
      const delRes = await this.productService.softDeleteById(id, userId);
      if (delRes) {
        return {
          code: SUCCESS,
          message: '删除成功',
        };
      }
      return {
        code: PRODUCT_DEL_FAIL,
        message: '删除失败',
      };
    }
    return {
      code: PRODUCT_NOT_EXIST,
      message: '商品不存在',
    };
  }

  //獲取商品種類數據
  @Query(() => ProductTypesResults)
  async getProductTypes(): Promise<ProductTypesResults> {
    return {
      code: SUCCESS,
      data: PRODUCT_TYPES, //這裡由於沒有經過資料庫，所以直接回傳資料即可
      message: '獲取成功',
    };
  }

  //獲取商品筆數的資料(包含其經緯度距離) - 手機版
  @Query(() => ProductResults)
  async getProductsForH5(
    @Args('page') page: PageInput,
    @Args('longitude') longitude: number, // 經度
    @Args('latitude') latitude: number, // 緯度
    @Args('type', { nullable: true }) type?: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<ProductResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<Product> = {
      status: ProductStatus.LIST,
    };
    if (name) {
      where.name = name;
    }

    if (type) {
      where.type = type;
    }
    const { entities, raw } = await this.productService.findProductsOrderByDistance({
      start: (pageNum - 1) * pageSize,
      length: pageSize,
      where,
      position: {
        latitude,
        longitude,
      },
    })

    const total = await this.productService.getCount({ where });
    return {
      code: SUCCESS,
      data: entities.map((item, index) => {
        //這裡會將門店的距離做一些整理，並顯示，分別有小於1公里、大於1公里、大於5公里的
        const earth_radius_km = 6371  // 地球半徑 (公里)
        const distance = (raw[index].distance) * (3.14159 / 180) * earth_radius_km * 1000;
        // const distance = (raw[index].distance) * 120;
        let distanceLabel = '> 5km'
        if (distance < 1000 && distance > 0) {
          distanceLabel = `${parseInt(distance.toString(), 10)}m`;
        }
        if (distance >= 1000) {
          distanceLabel = `${parseInt((distance / 100).toString(), 10) / 10}km`;
        }
        if (distance > 5000) {
          distanceLabel = '>5km';
        }
        return {
          ...item,
          distance: distanceLabel,
        }
      }),
      page: {
        pageNum,
        pageSize,
        total,
      },
      message: '獲取成功',
    };
  }

  //獲取同門市的商品資料
  @Query(() => ProductResults)
  async getProductsByOrgIdForH5(@Args('orgId') orgId: string) {
    const [results] = await this.productService.findProducts({
      start: 0,
      length: 5,
      where: {
        org: {
          id: orgId,
        },
        status: ProductStatus.LIST,
      },
    });
    return {
      code: SUCCESS,
      data: results,
      message: '獲取成功',
    };
  }
}