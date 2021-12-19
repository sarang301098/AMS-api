import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { InventoryName } from '../model/mongo/InventoryName';

@EntityRepository(InventoryName)
export class InventoryNameRepository extends BaseRepository<InventoryName> {}
