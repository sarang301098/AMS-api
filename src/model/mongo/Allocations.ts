import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity('allocation', { database: 'mongodb' })
export class Users {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  inventoryId!: string;

  @Column()
  acknowledge!: boolean;

  @Column()
  assignedUserId!: string | null;

  @Column()
  description!: string | null;

  @Column()
  previousAssignedUserIds!: Array<string>;
}
