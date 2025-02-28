import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    console.log(`process.env.NODE_ENV => `, process.env.NODE_ENV)
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          autoLoadEntities: true,
        }),
        UserModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      const res = await appController.getHello();
      expect(res).toBe('Hello World!');
    });

    it('資料庫測試', async () => {
      await appController.create('1');
      const res = await appController.findUser('1');
      expect(res.name).toBe('水滴超级管理員4');
    });
  });


});
