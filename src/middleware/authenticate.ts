import { RequestHandler } from 'express';
import { getConnection } from 'typeorm';

import { UnauthorizedError, BadRequestError } from '../error';
import { verifyToken, isAccessToken } from '../service/token';
import { createDetailCacheKey } from '../utils/cache';
import { getAuthCookie } from '../utils/cookie';
import { Users as MongoUsers } from '../model/mongo/users';
import { Token } from '../constants';

export const authenticate: RequestHandler = async (request, response, next): Promise<void> => {
  const authHeader = request.headers.authorization;
  const authCookie = getAuthCookie(request.headers.cookie as string);

  if (!authHeader && !authCookie) {
    return next(new UnauthorizedError('JWT token is missing', 'TOKEN_MISSING'));
  }

  const [, token] = (authCookie ?? authHeader ?? '').split(' ');

  try {
    const decoded = await verifyToken(token, Token.ACCESS);

    if (!isAccessToken(decoded)) {
      throw new BadRequestError('Provided token is not valid access token', 'INVALID_ACCESS_TOKEN');
    }

    const { sub } = decoded;

    const cacheKey = createDetailCacheKey('user', sub);

    const mongoConn = getConnection('mongodb');
    const usersRepo = mongoConn.getMongoRepository(MongoUsers);

    const user = await usersRepo.findOne(
      { id: sub },
      {
        cache: { id: cacheKey, milliseconds: 1000 * 60 },
      },
    );

    if (!user) {
      return next(new UnauthorizedError('User do not exist.'));
    }

    request.user = user;

    return next();
  } catch (err) {
    return next(new UnauthorizedError('Invalid JWT token', 'INVALID_TOKEN'));
  }
};
