/* eslint-disable @typescript-eslint/ban-types */
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

import { UserType } from '../../constants';

@Entity('users', { database: 'mongodb' })
export class Users {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  id!: string;

  @Column()
  email!: string | null;

  @Column()
  username!: string | null;

  @Column()
  password!: string | null;

  @Column()
  authToken!: string | null;

  @Column()
  resetPasswordToken!: string | null;

  @Column()
  type!: string | null;

  @Column()
  lastLogin!: Date | null;

  @Column()
  avatar!: string | null;

  @Column('simple-json')
  address!: {
    area: string;
    city: string;
    state: string;
    pincode: number;
  };

  @Column('simple-json')
  general!: {
    fName: string;
    mName: string;
    lName: string;
    gender: string | boolean;
    dob: Date;
  };

  @Column('simple-json')
  contact!: {
    workEmail: string;
    personalEmail: string;
    workPhone: number;
    personalPhone: number;
    residencePhone: number;
    skypeId: string;
  };

  @Column()
  employeeNo!: string | number | null;

  @Column('simple-array')
  assignedInventory!: Array<{ inventoryName: string; inventoryDetailId: string }>;

  isSuperAdmin = (): boolean => this.type === UserType.SUPER_ADMIN;

  isAdmin = (): boolean => this.type === UserType.ADMIN;
}
