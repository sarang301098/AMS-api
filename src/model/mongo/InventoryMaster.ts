import {
  Column,
  Entity,
  ObjectID,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventoryMaster', { database: 'mongodb' })
export class InventoryMaster {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  inventoryName!: string | null;

  @Column()
  availableUnits!: number | number;

  @Column()
  totalUnits!: number | number;

  @Column()
  assignedUnits!: number | number;

  @Column()
  Description!: string | null;

  @Column()
  brandId!: string | null;

  @Column()
  modelId!: string | null;

  @Column()
  createdBy!: string | null;

  @Column()
  updatedBy!: string | null;

  @Column()
  isActive!: boolean | null;

  @Column()
  isDeleted!: boolean | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt!: Date;
}
