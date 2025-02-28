import { CommonEntity } from '@/common/entities/common.entities';
import { Organization } from '@/modules/organization/models/organization.entity';
import { Product } from '@/modules/product/models/product.entity';
import { Student } from '@/modules/student/models/student.entity';
import { Wxorder } from '@/modules/wxorder/models/wxorder.entity';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';

/**
 * 商品訂單實體
 */
@Entity('order')
export class Order extends CommonEntity {
  @Column({
    comment: '訂單號',
    default: '',
  })
  outTradeNo: string;

  @Column({
    comment: '手機號碼',
    nullable: true,
  })
  tel: string;

  @Column({
    comment: '數量',
    nullable: true,
  })
  quantity: number;

  @Column({
    comment: '總金額',
    nullable: true,
  })
  amount: number;

  @Column({
    comment: '支付狀態',
    nullable: true,
  })
  status: string;

  @ManyToOne(() => Organization, {
    cascade: true,
  })
  org: Organization;

  @ManyToOne(() => Product, {
    cascade: true,
  })
  product: Product;

  @ManyToOne(() => Student, {
    cascade: true,
  })
  student: Student;

  //一個訂單只會對應一個微信支付訂單號
  @OneToOne(() => Wxorder, (wxorder) => wxorder.order, { cascade: true })
  wxOrder?: Wxorder;
}
