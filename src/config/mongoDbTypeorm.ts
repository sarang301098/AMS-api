import { ConnectionOptions } from 'typeorm';

import config from '../config';

const baseFolder = config.isProd ? 'dist' : 'src';

const mongoDbTypeormConfig = {
  name: 'mongodb',
  // type: config.MONGODB_CONNECTION,
  // host: config.MONGODB_HOST,
  // port: config.MONGODB_PORT,
  // username: config.MONGODB_USERNAME,
  // password: config.MONGODB_PASSWORD,
  // database: config.MONGODB_DATABASE,
  // entities: [`${baseFolder}/model/mongo/**/*{.js,.ts}`],
  // useUnifiedTopology: true,
  // useNewUrlParser: true,
  // authSource: 'admin',
  // synchronize: true,
  // logging: false,
  
  type: 'mongodb',
  url:
      'mongodb+srv://root:root@cluster0.sqnju.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  useNewUrlParser: true,
  synchronize: true,
  logging: true,
  entities: [`${baseFolder}/model/mongo/**/*{.js,.ts}`],
} as any;

export default mongoDbTypeormConfig;
