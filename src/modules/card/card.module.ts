import { Module, ConsoleLogger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './models/card.entity';
import { CardServices } from './card.services';
import { CardResolver } from './card.resolver';


@Module({
  imports: [
    TypeOrmModule.forFeature([Card])
  ],
  providers: [CardServices, CardResolver],
  exports: [CardServices]
})

export class CardModule { }
