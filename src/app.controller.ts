import { Controller, Get } from '@nestjs/common';
import { UserServices } from './modules/user/user.services';
import { User } from './modules/user/models/user.entity';
import { AppService } from './app.service';


@Controller()

export class AppController {
  /*這邊透過private 來定義我們的useSerive，定義好後就可以直接使用(NestJS在定義完後會自動注入)*/
  constructor(
    private readonly useService: UserServices,
    private readonly appService: AppService,
  ) { }

  @Get('/create')
  async create(id: string): Promise<string> {
    const res = await this.useService.addUser({
      id,
      name: '水滴超级管理員4',
      desc: '管理員4',
      tel: '444444444444',
      password: '123456',
      account: 'admin',
    })
    /*這裡的return最終會打回到前端*/
    return (res) ? '新增成功' : "新增失敗"
  }

  @Get('/delete')
  async deleteUser(): Promise<string> {
    const res = await this.useService.deleteUser('5af6be56-13ee-4e83-b6cf-0aec3a82d613')
    console.log('delete => ', res)
    return (res) ? '刪除成功' : "刪除失敗"
  }

  @Get('/update')
  async updateUser(): Promise<string> {
    const res = await this.useService.updateUser(
      'bf51ad1e-05d2-4987-9a8e-f64f1ad292ad',
      {
        name: '水滴超级管理員11111',
        desc: '管理員1',
        tel: '11111111111',
        password: '11111',
        account: 'admin',
      })
    console.log('update => ', res)
    return (res) ? '更新成功' : "更新失敗"
  }

  @Get('/find')
  async findUser(id: string): Promise<User> {
    const res = await this.useService.findUser(id)
    // const res = await this.useService.findUser('bf51ad1e-05d2-4987-9a8e-f64f1ad292ad')
    console.log('find => ', res)
    return res
  }


  //這裡寫一個getHello()，用來做測試用
  @Get('/getHello')
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }
}