import { OSSServices } from './oss.services';
import { Module } from '@nestjs/common';
import { OSSResolver } from './oss.resolver';



@Module({
  imports: [],
  providers: [OSSResolver, OSSServices],
  exports: []
})

export class OSSModule { }
