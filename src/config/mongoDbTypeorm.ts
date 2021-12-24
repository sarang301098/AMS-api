import { ConnectionOptions } from 'typeorm';

import config from '../config';

const baseFolder = config.isProd ? 'dist' : 'src';

const mongoDbTypeormConfig = {
  name: 'mongodb',
  type: 'mongodb',
  url:
    'mongodb+srv://root:root@cluster0.sqnju.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  useNewUrlParser: true,
  synchronize: true,
  logging: true,
  entities: [`${baseFolder}/model/mongo/**/*{.js,.ts}`],
} as ConnectionOptions;

export default mongoDbTypeormConfig;
