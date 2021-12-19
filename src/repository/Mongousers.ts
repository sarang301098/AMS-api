import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { Users as MongoUsers } from '../model/mongo/users';

@EntityRepository(MongoUsers)
export class MongoUsersRepository extends BaseRepository<MongoUsers> {
  // async updateLastLogin(id: string): Promise<void> {
  //   await this.update(id, { lastLogin: new Date() });
  // }
  // async updateAvatar(user: MongoUsers, avatar: string): Promise<void> {
  //   await this.update(user.id, { avatar });
  // }
}
