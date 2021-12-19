import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { RequestMaster } from '../model/mongo/RequestMaster';
@EntityRepository(RequestMaster)
export class RequestRepository extends BaseRepository<RequestMaster> {}
