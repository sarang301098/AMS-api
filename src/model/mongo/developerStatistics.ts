import { Column, Entity, ObjectIdColumn, ObjectID } from 'typeorm';

@Entity('developerStatistics', { database: 'mongodb' })
export class DeveloperStatistics {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  developerId!: string | null;

  @Column()
  date!: Date | string | null;

  @Column()
  visits!: number | null;
}
