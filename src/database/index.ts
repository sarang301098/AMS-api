import { createConnection, Connection } from 'typeorm';

import mongoDbTypeormConfig from '../config/mongoDbTypeorm';

export default class Database {
  static #instance: Database;

  #connection?: Connection;
  #mongoConnection?: Connection;

  constructor() {
    if (Database.#instance instanceof Database) {
      return Database.#instance;
    }

    Database.#instance = this;
  }

  get connection(): Connection | undefined {
    return this.#connection;
  }

  // TODO MYSQL with MongoDbs
  async connect(): Promise<Connection> {
    [this.#connection] = await Promise.all([createConnection(mongoDbTypeormConfig)]);
    return this.#connection;
  }

  async disConnect(): Promise<void> {
    if (this.#connection) {
      await this.#connection.close();
    }
    if (this.#mongoConnection) {
      await this.#mongoConnection.close();
    }
  }
}
