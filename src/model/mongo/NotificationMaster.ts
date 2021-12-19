import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity('notificationMaster', { database: 'mongodb' })
export class NotificationMaster {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  toId!: string | null;

  @Column()
  isRead!: boolean;

  @Column()
  description!: string | null;

  @Column()
  fromId!: string | null;

  @Column()
  inventoryName!: string | null;

  @Column()
  isCreatedByAdmin!: boolean;

  @Column()
  createdAt!: Date;
}
