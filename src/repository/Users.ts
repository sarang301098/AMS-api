import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { Users } from '../model/mongo/users';

@EntityRepository(Users)
export class UsersRepository extends BaseRepository<Users> {}
