import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { ModelDetail } from '../model/mongo/ModelDetail';

@EntityRepository(ModelDetail)
export class ModelDetailRepository extends BaseRepository<ModelDetail> {}
