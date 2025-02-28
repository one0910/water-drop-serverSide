import { Organization } from '@/modules/organization/models/organization.entity';
import { IsNotEmpty } from 'class-validator';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 机构资源
 */
@Entity('org_image')
export class OrgImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    comment: '地址',
  })
  @IsNotEmpty()
  url: string;

  @Column({
    comment: 'remark',
    nullable: true,
  })
  remark: string;

  //圖片對於機構來說就是多對一的關係
  @ManyToOne(() => Organization, (org) => org.orgFrontImg)
  orgIdForFront: Organization


  @ManyToOne(() => Organization, (org) => org.orgRoomImg)
  orgIdForRoom: Organization;

  @ManyToOne(() => Organization, (org) => org.orgOtherImg)
  orgIdForOther: Organization;
}

