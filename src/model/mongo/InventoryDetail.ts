import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventoryDetail', { database: 'mongodb' })
export class InventoryDetail {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  inventoryId!: string | null;

  @Column()
  isAssigne!: boolean | null;

  @Column()
  label!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt!: Date;
}
