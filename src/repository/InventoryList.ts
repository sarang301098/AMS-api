import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { InventoryDetail } from '../model/mongo/InventoryDetail';

@EntityRepository(InventoryDetail)
export class InventoryDetailRepository extends BaseRepository<InventoryDetail> {}
