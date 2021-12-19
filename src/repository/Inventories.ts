import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { InventoryAssignedDetail } from '../model/mongo/InventoryAssignedDetail';

@EntityRepository(InventoryAssignedDetail)
export class InventoryAssignedDetailRepository extends BaseRepository<InventoryAssignedDetail> {}
