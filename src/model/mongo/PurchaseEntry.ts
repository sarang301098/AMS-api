import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('purchaseEntry', { database: 'mongodb' })
export class PurchaseEntry {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  brandId!: string | null;

  @Column()
  purchasedDate!: Date | null;

  @Column()
  units!: number;

  @Column()
  singleUnitAmount!: number | null;

  @Column()
  totalAmount!: number | null;

  @Column()
  inventoryName!: string | null;

  @Column()
  modelId!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt!: Date;
}
