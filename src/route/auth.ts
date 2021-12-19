import { Router } from 'express';
import { validate } from 'express-validation';

import { handleError, openLimiter } from '../middleware';
import {
  loginValidation,
  login,
  refreshTokenValidation,
  refreshToken,
  twilioValidation,
  twilioSms,
} from '../controller/auth';

const router = Router();

const signin = (): Router =>
  router.post(
    '/login',
    openLimiter(),
    validate(loginValidation, { context: true }),
    handleError(login()),
  );

const refresh = (): Router =>
  router.post(
    '/refresh',
    openLimiter(),
    validate(refreshTokenValidation),
    handleError(refreshToken()),
  );

const sms = (): Router =>
  router.post('/sms', openLimiter(), validate(twilioValidation), handleError(twilioSms()));

export default (): Router => router.use([signin(), refresh(), sms()]);
