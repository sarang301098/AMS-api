import { Column, Entity, CreateDateColumn, ObjectIdColumn, ObjectID } from 'typeorm';

export enum VerificationStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum VerificationType {
  EMAIL = 'EMAIL',
}

@Entity('verifications', { database: 'mongodb' })
export class Verifications {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  id!: string;

  @Column()
  identifier!: string;

  @Column()
  token!: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    name: 'status',
    nullable: false,
    default: VerificationStatus.PENDING,
  })
  status!: string;

  @Column({
    type: 'enum',
    enum: VerificationType,
    name: 'type',
    nullable: false,
    default: VerificationType.EMAIL,
  })
  type!: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'expire_at',
    nullable: true,
  })
  expireAt!: Date | null;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    nullable: true,
  })
  createdAt!: Date | null;
}
