import { URL } from 'url';

import {
  cleanEnv,
  str,
  port,
  url,
  host,
  makeValidator,
  num,
  CleanedEnvAccessors,
  email,
} from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

const origins = makeValidator<(string | RegExp)[]>((x: string) => {
  let origins: string[];
  try {
    origins = JSON.parse(x);
  } catch (error) {
    throw new Error(`Invalid urls: "${x}"`);
  }
  return origins.map((origin, index) => {
    if (origin.startsWith('regex://')) {
      const pattern = origin.replace('regex://', '');
      return new RegExp(pattern);
    } else {
      try {
        const parseURL = new URL(origin);
        if (!parseURL.origin || parseURL.origin === 'null') {
          throw new Error(`Invalid url at position [${index}]: "${origin}"`);
        }
        return parseURL.origin;
      } catch (e) {
        throw new Error(`Invalid url at position [${index}]: "${origin}"`);
      }
    }
  });
});

const strHex64 = makeValidator<string>((x) => {
  if (/^[0-9a-f]{64}$/.test(x)) {
    return x;
  }
  throw new Error('Expected a hex-character string of length 64');
});

const AWS_REGIONS = [
  'us-east-2',
  'us-east-1',
  'us-west-1',
  'us-west-2',
  'ap-east-1',
  'ap-south-1',
  'ap-northeast-3',
  'ap-northeast-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ca-central-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-north-1',
  'me-south-1',
  'sa-east-1',
];

const awsRegion = makeValidator<string>((region) => {
  if (AWS_REGIONS.includes(region)) {
    return region;
  } else {
    throw new Error(`${region} is not a valid AWS region.`);
  }
});

type Environment = {
  NODE_ENV: string;
  PORT: number;
  SERVER_URL: string;
  LOG_LEVEL: string;
  WHITELIST_ORIGINS: (string | RegExp)[];
  MEDIA_FOLDER: string;
  REPORT_FOLDER: string;
  SECRET_HEX: string;
  ACCESS_TOKEN_LIFETIME_MIN: number;
  REFRESH_TOKEN_LIFETIME_MIN: number;
  MAX_FILE_SIZE_IN_MB: number;
  MAX_APK_FILE_SIZE_IN_MB: number;
  GLOBAL_REQUEST_TIMEOUT_IN_MS: number;
  OPEN_API_MAX_REQUEST: number;
  OPEN_API_WINDOW_IN_MS: number;
  CLOSED_API_MAX_REQUEST: number;
  CLOSED_API_WINDOW_IN_MS: number;
  POSTGRES_CONNECTION: string;
  POSTGRES_HOST: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_PORT: number;
  MONGODB_CONNECTION: string;
  MONGODB_HOST: string;
  MONGODB_USERNAME: string;
  MONGODB_PASSWORD: string;
  MONGODB_DATABASE: string;
  MONGODB_PORT: number;
  SLACK_WEBHOOK: string | undefined;
  REDIS_HOST: string;
  REDIS_PORT: number;
  CACHE_DURATION_IN_MS: number;
  GMAIL_USER: string;
  GMAIL_CLIENT_ID: string;
  GMAIL_CLIENT_SECRET: string;
  GMAIL_REFRESH_TOKEN: string;
  GMAIL_PASSWORD: string;
  FORGET_PASSWORD_MAIL_SUBJECT: string;
  FORGET_PASSWORD_TOKEN_LENGTH: number;
  FORGET_PASSWORD_TOKEN_EXPIRE_TIME: number;
  FRONTEND_BASE_URL: string;
  FRONTEND_CHANGE_PASSWORD_URL: string;
  CUSTOMER_SERVICE_EMAIL: string;
  REPORT_MAIL_SUBJECT: string;
  PUPPETEER_EXECUTABLE_PATH: string;
  SUPPORT_EMAIL_RECIPIENT_EMAIL_ID: string;
  TEST_DATABASE_URL: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  S3_CAMERA_TEST_BUCKET: string;
  S3_USER_MEDIA_BUCKET: string;
  B2_NAME: string;
  B2_KEY_NAME: string;
  B2_KEY_ID: string;
  B2_SECRET_KEY: string;
  B2_ENDPOINT: string;
  MACHINE_RPM_JOB_INTERVAL_IN_MIN: number;
  AGENDA_COLLECTION_NAME: string;
  SENTRY_DNS: string | undefined;
  SENTRY_ENV: string;
  SUSTAINABILITY_VALUES_WATER: number;
  SUSTAINABILITY_VALUES_ENERGY: number;
  SUSTAINABILITY_VALUES_MESH: number;
  SUSTAINABILITY_VALUES_CO2: number;
  SAVINGS_REPORT_PATH: string;
  UPDATE_STOPS_JOB_CRON_EXPRESSION: string;
  NOTION_CLIENT_COMPLAINT_TOKEN: string | undefined;
  NOTION_CLIENT_COMPLAINT_DATABSE: string | undefined;
  UPDATE_DEFECT_LABEL_FOR_STOPS_INTERVAL: number;
  SENDGRID_API_KEY: string;
};

export type Env = Readonly<Environment & CleanedEnvAccessors>;

const env: Env = cleanEnv<Environment>(process.env, {
  NODE_ENV: str({
    choices: ['production', 'test', 'development'],
    default: 'development',
  }),
  PORT: port({ default: 3333 }),
  SERVER_URL: url(),
  LOG_LEVEL: str({
    default: 'error',
    choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
  }),
  WHITELIST_ORIGINS: origins({
    default: ['http://localhost', 'http://localhost:3000', 'http://localhost:3333'],
  }),
  MEDIA_FOLDER: str({ default: 'media' }),
  REPORT_FOLDER: str({ default: 'reports' }),
  SECRET_HEX: strHex64(),
  ACCESS_TOKEN_LIFETIME_MIN: num(),
  REFRESH_TOKEN_LIFETIME_MIN: num(),
  MAX_FILE_SIZE_IN_MB: num({ default: 1 }),
  MAX_APK_FILE_SIZE_IN_MB: num({ default: 1 }),
  GLOBAL_REQUEST_TIMEOUT_IN_MS: num({ default: 1000 * 60 * 5 }),
  OPEN_API_MAX_REQUEST: num({ default: 3 }),
  OPEN_API_WINDOW_IN_MS: num({ default: 1000 }),
  CLOSED_API_MAX_REQUEST: num({ default: 3 }),
  CLOSED_API_WINDOW_IN_MS: num({ default: 1000 }),
  POSTGRES_CONNECTION: str({
    default: 'postgres',
    choices: [
      'mysql',
      'mariadb',
      'postgres',
      'cockroachdb',
      'sqlite',
      'mssql',
      'sap',
      'oracle',
      'cordova',
      'nativescript',
      'react-native',
      'sqljs',
      'mongodb',
      'aurora-data-api',
      'aurora-data-api-pg',
      'expo',
    ],
  }),
  POSTGRES_HOST: host({ default: 'localhost' }),
  POSTGRES_USER: str(),
  POSTGRES_PASSWORD: str(),
  POSTGRES_DB: str({ default: 'peerbits' }),
  POSTGRES_PORT: port({ default: 5432 }),
  MONGODB_CONNECTION: str({ default: 'mongodb' }),
  MONGODB_HOST: host({ default: 'localhost' }),
  MONGODB_USERNAME: str(),
  MONGODB_PASSWORD: str(),
  MONGODB_DATABASE: str({ default: 'peerbits' }),
  MONGODB_PORT: port({ default: 3333 }),
  SLACK_WEBHOOK: url({ default: undefined }),
  REDIS_HOST: str({ default: '127.0.0.1' }),
  REDIS_PORT: port({ default: 6379 }),
  CACHE_DURATION_IN_MS: num({ default: 1000 * 7 }),
  GMAIL_USER: email({ default: 'sarang.p@peerbits.com' }),
  GMAIL_PASSWORD: str({ default: '*****' }),
  GMAIL_CLIENT_ID: str({ default: '*****' }),
  GMAIL_CLIENT_SECRET: str({ default: '*****' }),
  GMAIL_REFRESH_TOKEN: str({ default: '*****' }),
  FORGET_PASSWORD_MAIL_SUBJECT: str({ default: 'Forget Password | Peerbits' }),
  FORGET_PASSWORD_TOKEN_LENGTH: num({ default: 16 }),
  FORGET_PASSWORD_TOKEN_EXPIRE_TIME: num({ default: 15 }),
  FRONTEND_BASE_URL: str({ default: 'http://localhost:3000' }),
  FRONTEND_CHANGE_PASSWORD_URL: str({ default: '/reset-Password' }),
  CUSTOMER_SERVICE_EMAIL: str(),
  REPORT_MAIL_SUBJECT: str(),
  PUPPETEER_EXECUTABLE_PATH: str({ default: '/snap/bin/chromium' }),
  SUPPORT_EMAIL_RECIPIENT_EMAIL_ID: str(),
  TEST_DATABASE_URL: str({ default: '*****' }), // Mongo server connection url
  AWS_REGION: awsRegion({ default: 'eu-west-2' }),
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  S3_CAMERA_TEST_BUCKET: str(),
  S3_USER_MEDIA_BUCKET: str(),
  B2_NAME: str(),
  B2_KEY_NAME: str(),
  B2_KEY_ID: str(),
  B2_SECRET_KEY: str(),
  B2_ENDPOINT: url(),
  MACHINE_RPM_JOB_INTERVAL_IN_MIN: num({ default: 30 }),
  AGENDA_COLLECTION_NAME: str({ default: 'AgendaJobs' }),
  SENTRY_DNS: url({ default: undefined }),
  SENTRY_ENV: str({
    default: 'local',
    choices: ['local', 'development', 'demo', 'test', 'production'],
  }),
  SUSTAINABILITY_VALUES_WATER: num({ default: 1344 }),
  SUSTAINABILITY_VALUES_ENERGY: num({ default: 108 }),
  SUSTAINABILITY_VALUES_MESH: num({ default: 12 }),
  SUSTAINABILITY_VALUES_CO2: num({ default: 27 }),
  SAVINGS_REPORT_PATH: str({ default: '/rolls/rollDetail' }),
  UPDATE_STOPS_JOB_CRON_EXPRESSION: str({ default: '0 0 22 ? * *' }),
  NOTION_CLIENT_COMPLAINT_TOKEN: str({ default: undefined }),
  NOTION_CLIENT_COMPLAINT_DATABSE: str({ default: undefined }),
  UPDATE_DEFECT_LABEL_FOR_STOPS_INTERVAL: num({ default: 1 }),
  SENDGRID_API_KEY: str(),
});

export default env;
