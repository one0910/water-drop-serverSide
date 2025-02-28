import { Entity, Column, ManyToOne } from "typeorm"
import { IsNotEmpty } from "class-validator"
import { CommonEntity } from "@/common/entities/common.entities"
import { Organization } from "@/modules/organization/models/organization.entity";

@Entity('teacher')

/**
 * 组件
*/
export class Teacher extends CommonEntity {
  @Column({
    comment: '名稱',
  })
  name: string;

  @Column({
    comment: '照片',
    nullable: true,
  })
  photoUrl: string;

  @Column({
    comment: '教齡',
    nullable: true,
  })
  teacherTime: number;

  @Column({
    comment: '学历',
    nullable: true,
  })
  education: string;

  @Column({
    comment: '資歷',
    nullable: true,
  })
  seniority: string;

  @Column({
    comment: '職業經驗',
    nullable: true,
  })
  experience: string;

  @Column({
    comment: '獲獎經歷',
    nullable: true,
  })
  carryPrize: string;

  @Column({
    comment: '風格標籤，以，隔开',
    nullable: true,
  })
  tags: string;

  @ManyToOne(() => Organization)
  org: Organization;
}