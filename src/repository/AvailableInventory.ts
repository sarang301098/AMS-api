import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { InventoryMaster } from '../model/mongo/InventoryMaster';

@EntityRepository(InventoryMaster)
export class InventoryMasterRepository extends BaseRepository<InventoryMaster> {}
