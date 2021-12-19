import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { BrandDetail } from '../model/mongo/BrandDetail';

@EntityRepository(BrandDetail)
export class BrandDetailRepository extends BaseRepository<BrandDetail> {}
