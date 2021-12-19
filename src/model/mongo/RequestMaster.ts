// import { ObjectId } from 'mongodb';
import {
  Column,
  Entity,
  ObjectID,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RequestStatus } from '../../constants';
@Entity('requestMaster', { database: 'mongodb' })
export class RequestMaster {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  fromUserId!: string | null;

  @Column('string', { default: RequestStatus.PENDING })
  status!: string | null;

  @Column()
  inventoryId!: string | null;

  @Column()
  inventoryName!: string | null;

  @Column()
  priority!: string | number;

  @Column()
  descriptionNote!: string | null;

  @Column()
  approvedUserId!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt!: Date;
}
