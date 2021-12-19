// import {
//   Column,
//   Entity,
//   Index,
//   JoinColumn,
//   OneToOne,
//   PrimaryGeneratedColumn,
//   RelationId,
// } from 'typeorm';

// import { EmailFrequency, TimeFormat, UnitPreferance } from '../constants';

// import { Users } from './Users';

// @Entity('general_settings', { schema: 'public' })
// export class GeneralSettings {
//   @PrimaryGeneratedColumn('uuid')
//   id!: string;

//   @Column('character varying', {
//     default: 'en',
//     length: 5,
//     nullable: false,
//     comment: 'ISO 639-1 codes',
//   })
//   language!: string;

//   @Column({ type: 'enum', enum: TimeFormat, default: TimeFormat['24H'], nullable: false })
//   timeFormat!: string;

//   @Column({ type: 'enum', enum: UnitPreferance, default: UnitPreferance.RPM, nullable: false })
//   unitPreferance!: string;

//   @Column({ type: 'enum', enum: EmailFrequency, default: EmailFrequency.MONTH, nullable: false })
//   emailFrequency!: string;

//   @Column('text', { array: true, nullable: true })
//   additionalEmails!: string[] | null;

//   @Column('boolean', { default: () => 'false', nullable: false })
//   emailSubscription!: boolean;

//   @Index({ unique: true })
//   @OneToOne(() => Users, (ckm) => ckm.notificationSetting, {
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE',
//     nullable: false,
//   })
//   @JoinColumn()
//   user!: Users;

//   @RelationId((generalSettings: GeneralSettings) => generalSettings.user)
//   userId!: string;
// }
