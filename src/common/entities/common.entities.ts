import { validateOrReject, IsDate, IsOptional } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
資料庫實體也可以做客制化，以這裡為例，
可以建立一個在專案中會常用的CommonEntity，如下所示
*/
export class CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    comment: '建立時間',
    nullable: true,
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp'
  })
  createdAt: Date;

  @Column({
    comment: '建立者',
    nullable: true,
  })
  //IsOptional()用來判斷是否為空或是undefined
  @IsOptional()
  createdBy: string;

  @Column({
    comment: '修改時間',
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp',
    nullable: true,
  })
  updatedAt: Date;

  @Column({
    comment: '修改者',
    nullable: true,
  })

  @IsOptional()
  updatedBy: string;

  @Column({
    comment: '删除時間',
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp',
    nullable: true,
  })

  /**
    1.透過DeleteDateColumn來建立軟刪除，而並非刪除整個資料
    2.以這為例，加了一個deletedAt刪除日期的欄位，只要該欄位為裡面有設置時間，則視同軟刪除，而該資料
    3.軟刪除在大公司專案很常見，有些重要資料是需要保留比較久的
  */
  @DeleteDateColumn()
  @IsDate()
  @IsOptional()
  deletedAt: Date;

  @Column({
    comment: '删除者',
    nullable: true,
  })
  @IsOptional()
  deletedBy: string;


  @BeforeInsert()
  setCreatedAt() {
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  async validateBeforeInsert() {
    await validateOrReject(this);
  }

  @BeforeUpdate()
  async validateBeforeUpdate() {
    await validateOrReject(this, { skipMissingProperties: true });
  }
}
