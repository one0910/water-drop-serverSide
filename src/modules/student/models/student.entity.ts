import { Entity, Column } from "typeorm"
import { CommonEntity } from "@/common/entities/common.entities"

@Entity('student')

/**
 * 组件
*/
export class Student extends CommonEntity {
  @Column({
    comment: '匿稱',
    default: '',
  })
  name: string;

  @Column({
    comment: '手機號',
    nullable: true,
  })
  tel: string;

  @Column({
    comment: '頭像',
    nullable: true,
    default: `https://api.dicebear.com/7.x/miniavs/svg?seed=${Math.floor(Math.random() * 10000)}`
  })
  avatar: string;

  @Column({
    comment: '密碼',
  })
  password: string;

  @Column({
    comment: '帳戶',
  })
  account: string;

  @Column({
    comment: 'openid',
    nullable: true,
  })
  openid?: string;
}