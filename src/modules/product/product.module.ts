import { Module, ConsoleLogger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './models/product.entity';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';


@Module({
  imports: [
    TypeOrmModule.forFeature([Product])
  ],
  providers: [ProductService, ProductResolver],
  exports: [ProductService]
})

export class ProductModule { }
