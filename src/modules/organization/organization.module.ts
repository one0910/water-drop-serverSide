import { OrgImageService } from './../orgImage/orgImage.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './models/organization.entity';
import { OrganizationServices } from './organization.services';
import { OrganizationResolver } from './organization.resolver';
import { OrgImage } from '../orgImage/models/orgImage.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, OrgImage])
  ],
  providers: [OrganizationServices, OrganizationResolver, OrgImageService],
  exports: [OrganizationResolver] //這裡的export目的是要讓其他地方可以使用此TempServices，所以必須得加
})

export class OrganizationModule { }
