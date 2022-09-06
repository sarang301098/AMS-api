import { ConnectionOptions } from 'typeorm';

import config from '../config';

const baseFolder = config.isProd ? 'dist' : 'src';

const mongoDbTypeormConfig = {
  name: 'mongodb',
  type: 'mongodb',
  url:
    'mongodb+srv://sarang_3010:Sarang@30@cluster0.zus57hs.mongodb.net/?retryWrites=true&w=majority',
  database: 'Ams',
  useNewUrlParser: true,
  useUnifiedTopology: true,
  synchronize: true,
  logging: true,
  entities: [`${baseFolder}/model/mongo/**/*{.js,.ts}`],
} as ConnectionOptions;

export default mongoDbTypeormConfig;
