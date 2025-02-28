import { Entity, Column } from "typeorm"
import { IsNotEmpty } from "class-validator"
import { CommonEntity } from "@/common/entities/common.entities"

@Entity('user')

export class User extends CommonEntity {
  @Column({
    comment: '暱稱',
    default: ''
  })
  // @IsNotEmpty()
  name: string

  @Column({
    comment: '簡介',
    default: ''
  })
  // @IsNotEmpty()
  desc: string

  @Column({
    comment: '聯絡電話',
    nullable: true,
  })
  tel: string


  @Column({
    comment: '個人頭像',
    nullable: true,
    default: `https://api.dicebear.com/7.x/miniavs/svg?seed=${Math.floor(Math.random() * 10000)}`
  })
  avatar: string

  @Column({
    comment: '密碼',
    nullable: true,
    default: ''
  })
  password: string

  @Column({
    comment: '帳號',
    nullable: true,
    default: ''
  })
  account: string

  @Column({
    comment: '驗證碼',
    nullable: true,
  })
  code: string

  @Column({
    comment: '驗證碼生成時間',
    nullable: true,
  })
  codeCreateTimeAt: Date;
}