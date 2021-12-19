import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { PurchaseEntry } from '../model/mongo/PurchaseEntry';
@EntityRepository(PurchaseEntry)
export class PurchaseEntryRepository extends BaseRepository<PurchaseEntry> {}
