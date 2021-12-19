import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { NotificationMaster } from '../model/mongo/NotificationMaster';
@EntityRepository(NotificationMaster)
export class NotificationRepository extends BaseRepository<NotificationMaster> {}
