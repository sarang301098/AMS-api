import express, { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validation';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';

import { mediaFolder, reportFolder } from './config/upload';
import { AppError, NotFoundError, RequestTimeoutError } from './error';
import config from './config';
import routes from './route';
import routesV2 from './route/v2';
import * as Sentry from '@sentry/node';

const app = express();

// if (config.SENTRY_DNS && config.isProd) {
//   Sentry.init({
//     enabled: config.SENTRY_ENV !== 'local',
//     dsn: config.SENTRY_DNS,
//     release: 'smartex-backend@' + process.env.npm_package_version,
//     environment: config.SENTRY_ENV,
//   });
//   app.use(Sentry.Handlers.requestHandler({ ip: true }));
// }

app.set('port', config.PORT);
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: '*', // later restricted
    credentials: true,
  }),
);

app.use(compression());
// TODO: Only apply to long request
app.use((req, res, next) => {
  res.setTimeout(config.GLOBAL_REQUEST_TIMEOUT_IN_MS, () =>
    next(new RequestTimeoutError(`Request timeout for: [${req.method}] ${req.originalUrl}`)),
  );
  next();
});
app.use('/media', express.static(mediaFolder, { maxAge: 31557600000 }));
app.use('/reports', express.static(reportFolder, { cacheControl: false }));
app.use('/v2', routesV2());
app.use('/', routes());

app.use((req) => {
  throw new NotFoundError(
    `We are unable to locate requested API resource: [${req.method}] ${req.originalUrl}`,
    'API_ENDPOINT_NOT_FOUND',
  );
});

if (config.SENTRY_DNS && config.isProd) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err?.statusCode || 500).json({
      message: err.message ?? 'Internal Server Error',
      code: err.code ?? 'INTERNAL_SERVER_ERROR',
      ...(config.isDev && { stack: err?.stack }),
    });
  }

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }

  return res.status(500).json({
    message: err.message ?? 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
    ...(config.isDev && { stack: err?.stack }),
  });
});

export default app;
