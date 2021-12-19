import {
  Column,
  Entity,
  ObjectID,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventoryAssignedDetail', { database: 'mongodb' })
export class InventoryAssignedDetail {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  inventoryDetailId!: string;

  @Column()
  assignedDate!: Date | null;

  @Column()
  unAssignedDate!: Date | null;

  @Column()
  assignedUserId!: string | null;

  @Column()
  description!: string | null;

  @Column()
  isPreviouslyUsed!: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt!: Date;
}
