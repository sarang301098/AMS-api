import { Request, Response, CookieOptions } from 'express';
import { getCustomRepository, getConnection } from 'typeorm';
import { Joi } from 'express-validation';

import { UnauthorizedError, BadRequestError } from '../error';
import TwilioSmsService from '../service/TwilioSms';
import { comparePassword } from '../service/password';
import { UsersRepository } from '../repository/Users';
import { Users as MongoUsers } from '../model/mongo/users';
import { Token } from '../constants';
import config from '../config';
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  isRefreshToken,
  ITokenBase,
} from '../service/token';

export const loginValidation = {
  body: Joi.object({
    email: Joi.string().lowercase().max(255).email().required(),
    password: Joi.string().required(),
  }),
};

export const login = () => async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body || {};
  const mongoConn = getConnection('mongodb');
  const usersRepo = mongoConn.getMongoRepository(MongoUsers);

  const user = await usersRepo.findOne({ email }, { select: ['id', 'password'] });

  if (!user) {
    throw new UnauthorizedError('Incorrect credentials.');
  }

  if (!user.password) {
    throw new UnauthorizedError('Incorrect credentials.');
  }

  const passwordMatched = await comparePassword(password, user.password);

  if (!passwordMatched) {
    throw new UnauthorizedError('Incorrect credentials.');
  }

  const accessToken = await signAccessToken(user.id);
  const refreshToken = await signRefreshToken(user.id);

  // TODO: This may defer from token expiry
  const expiresIn = config.ACCESS_TOKEN_LIFETIME_MIN * 60;

  const cookieOptions: CookieOptions = {
    maxAge: expiresIn * 1000,
    secure: req.secure,
    httpOnly: true,
    sameSite: 'strict',
  };

  res.cookie('token', `Bearer ${accessToken}`, cookieOptions).status(200).json({
    token_type: 'bearer',
    access_token: accessToken,
    expires_in: expiresIn,
    refresh_token: refreshToken,
  });
};

export const refreshTokenValidation = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};
export const refreshToken = () => async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  let decoded: ITokenBase;
  try {
    decoded = await verifyToken(refreshToken, Token.REFRESH);
    if (!isRefreshToken(decoded)) {
      throw new BadRequestError(
        'Provided token is not valid refresh token',
        'INVALID_REFRESH_TOKEN',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Refresh token expired.', 'REFRESH_TOKEN_EXPIRED');
    }
    throw new BadRequestError('Provided token is not valid refresh token', 'INVALID_REFRESH_TOKEN');
  }

  const usersRepo = getCustomRepository(UsersRepository);

  // TODO: Use findOneOrFail with custom error
  const user = await usersRepo.findOneOrFail(decoded.sub);

  if (!user) {
    throw new UnauthorizedError('Incorrect credentials.');
  }

  if (!user?.status) {
    throw new BadRequestError('User inactive. Please call to support.', 'INACTIVE_USER');
  }

  const accessToken = await signAccessToken(user.id);
  const newRefreshToken = await signRefreshToken(user.id);

  // TODO: This may defer from token expiry
  const expiresIn = config.ACCESS_TOKEN_LIFETIME_MIN * 60;

  await usersRepo.updateLastLogin(user.id);

  const cookieOptions: CookieOptions = {
    maxAge: expiresIn * 1000,
    secure: req.secure,
    httpOnly: true,
    sameSite: 'strict',
  };

  res.cookie('token', `Bearer ${accessToken}`, cookieOptions).status(200).json({
    token_type: 'bearer',
    access_token: accessToken,
    expires_in: expiresIn,
    refresh_token: newRefreshToken,
  });
};

export const twilioValidation = {
  body: Joi.object({
    phone: Joi.string().required(),
  }),
};
export const twilioSms = () => async (req: Request, res: Response): Promise<void> => {
  const service = new TwilioSmsService();
  const result = await service.execute(req.body);

  res.json(result);
};
