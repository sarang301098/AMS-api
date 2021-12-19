import { RequestHandler } from 'express';

import { ForbiddenError } from '../error';
import { UserType } from '../constants';
import logger from '../service/log';

export const checkUserType = (...userTypes: UserType[]): RequestHandler => (req, _, next): void => {
  const { user = null } = req;

  if (!user) {
    logger.error(`Unable to find user while checking API: [${req.originalUrl}]`);
    return next(new ForbiddenError(`Unable to find user`, 'MISSING_USER'));
  }

  if (!userTypes.includes(user.type as UserType)) {
    logger.error(`User does not have access to API : [${req.originalUrl}]`);
    return next(new ForbiddenError(`User does not have access to API`));
  }
  return next();
};
