import { Column, Entity, ObjectIdColumn, ObjectID } from 'typeorm';

@Entity('developer', { database: 'mongodb' })
export class Developer {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  id!: string | null;

  @Column()
  developerId!: string | null;

  @Column()
  email!: string | null;

  @Column()
  fullname!: string | null;

  @Column()
  gender!: string | null;

  @Column()
  firstname!: string | null;

  @Column()
  technology!: string | null;

  @Column()
  technologies!: Array<string> | null;

  @Column()
  lastname!: string | null;

  @Column()
  pic!: string | null;

  @Column()
  deviceId!: string | null;

  @Column()
  deviceType!: string | null;

  @Column()
  pcId!: string | null;

  @Column()
  address!: string | null;

  @Column()
  status!: number | null;
}
