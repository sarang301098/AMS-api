import { getConnection } from 'typeorm';
import { Request, Response } from 'express';
import { Joi } from 'express-validation';
import { generateRandomHex } from '../service/random';

import { createDetailCacheKey, getAllDetailCacheKeys } from '../utils/cache';
import ForgetPasswordService from '../service/ForgetPasswordService';
import UpdatePasswordService from '../service/UpdatePasswordService';
import { hashPassword, comparePassword } from '../service/password';
import { BadRequestError, UnauthorizedError } from '../error';

import { UserType } from '../constants';
import { Users as MongoUsers } from '../model/mongo/users';
import { ObjectId } from 'mongodb';

const namePattern = '^[A-za-z]';
// Create New User with User Type
export const createUserValidation = {
  body: Joi.object({
    username: Joi.string().max(255).required(),
    email: Joi.string().max(255).lowercase().email().required(),
    password: Joi.string().min(6).max(128).required(), // TODO: May be 64
    type: Joi.string()
      .valid(...Object.values(UserType))
      .required(),
  }),
};
export const createUser = () => async (req: Request, res: Response): Promise<void> => {
  let { email, username, password, type } = req.body || {};

  if (!type) {
    type = 'user';
  }

  const mongoConn = getConnection('mongodb');
  const usersRepo = mongoConn.getMongoRepository(MongoUsers);

  const existingUser = await usersRepo.findOne({ email });

  if (existingUser) {
    throw new BadRequestError('Email address already used', 'EMAIL_ALREADY_EXIST');
  }

  const hashedPassword = await hashPassword(password);

  let user = usersRepo.create({
    id: generateRandomHex(10),
    username,
    email,
    password: hashedPassword,
    type,
    assignedInventory: [],
    address: {},
    general: {},
    contact: {},
    avatar: '',
  });

  user = await usersRepo.save(user);
  const { password: _, ...userInfo } = user;

  res.status(201).json(userInfo);
};

export const avatar = () => async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({});
};

// Change Password of the User
export const changePasswordValidation = {
  body: Joi.object({
    oldPassword: Joi.string().min(6).max(128).required(),
    newPassword: Joi.string().min(6).max(128).required(),
  }),
};
export const changePassword = () => async (req: Request, res: Response): Promise<void> => {
  const {
    user,
    body: { oldPassword, newPassword },
  } = req;

  const mongoConn = getConnection('mongodb');
  const usersRepo = mongoConn.getMongoRepository(MongoUsers);

  const userWithPassword = await usersRepo.findOneOrFail({ where: { id: user.id } });

  if (!userWithPassword.password) {
    throw new UnauthorizedError();
  }

  const result = await comparePassword(oldPassword, userWithPassword.password);

  if (!result) {
    throw new BadRequestError('Password mismatch', 'PASSWORD_MISMATCH');
  }

  user.password = await hashPassword(newPassword);
  await usersRepo.save(user);

  res.sendStatus(204);
};

export const getUserValidation = {
  params: Joi.object({ id: Joi.string().required() }),
};
export const getById = () => async (req: Request, res: Response): Promise<void> => {
  const {
    params: { id },
  } = req;

  const mongoConn = getConnection('mongodb');
  const usersRepo = mongoConn.getMongoRepository(MongoUsers);
  const user = await usersRepo.findOne(id);

  res.status(200).json(user);
};

// Update All Data Of the Current Loggedin User
export const updateUserValidation = {
  body: Joi.object({
    type: Joi.string().valid(...Object.values(UserType)),
    id: Joi.string().max(255),
    username: Joi.string().max(255),
    email: Joi.string().max(255).lowercase().email(),
    avatar: Joi.string().allow(''),
    address: Joi.object({
      area: Joi.string().max(255).allow(null),
      city: Joi.string().max(255).allow(null),
      state: Joi.string().max(255).allow(null),
      pincode: Joi.string().max(255).allow(null),
    }).allow({}),
    general: Joi.object({
      fName: Joi.string().max(255).regex(new RegExp(namePattern)),
      mName: Joi.string().max(255).regex(new RegExp(namePattern)),
      lName: Joi.string().max(255).regex(new RegExp(namePattern)),
      gender: Joi.string().max(255).allow(null),
      dob: Joi.date().default(new Date()),
    }).allow({}),
    contact: Joi.object({
      workEmail: Joi.string().max(255).lowercase().email(),
      personalEmail: Joi.string().max(255).lowercase().email(),
      workPhone: Joi.number().allow(null),
      residencePhone: Joi.number().allow(null),
      personalPhone: Joi.number().allow(null),
      skypeId: Joi.string().max(255).allow(null),
    }).allow({}),
    assignedInventory: Joi.array().items(Joi.string()),
  }),
};
export const updateProfile = () => async (req: Request, res: Response): Promise<void> => {
  const {
    user,
    params: { id },
  } = req;

  const mongoConn = getConnection('mongodb');
  const usersRepo = mongoConn.getMongoRepository(MongoUsers);

  let userToUpdate = user;

  if (user.isSuperAdmin()) {
    userToUpdate = await usersRepo.findOneOrFail(id);
  }

  userToUpdate = Object.assign({}, userToUpdate, req.body || {});

  await getConnection('mongodb').queryResultCache?.remove(getAllDetailCacheKeys('user', user.id));
  await usersRepo.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: userToUpdate });

  const { password: _, ...userInfo } = userToUpdate;
  res.json(userInfo);
};

export const forgetPasswordValidation = {
  body: Joi.object({ email: Joi.string().lowercase().max(255).email().required() }),
};
export const forgetPassword = () => async (req: Request, res: Response): Promise<void> => {
  const service = new ForgetPasswordService();
  const result = await service.execute(req.body);

  res.json(result);
};

// Get the Users Profile Data
export const userProfileValidation = {
  query: Joi.object({
    // TODO Filters Applied
  }),
};
export const profile = () => async (req: Request, res: Response): Promise<void> => {
  const { user } = req;

  const mongoConn = getConnection('mongodb');
  const usersRepo = mongoConn.getMongoRepository(MongoUsers);

  const cacheKey = createDetailCacheKey('user', user.id);

  const userData = await usersRepo.findOne({
    where: { id: user.id },
    cache: { id: cacheKey, milliseconds: 1000 * 60 * 10 },
  });

  const userInfo = Object.assign({}, userData, { password: undefined });
  res.json(userInfo);
};

export const resetPasswordValidation = {
  params: Joi.object({ id: Joi.string().required() }),
  body: Joi.object({
    password: Joi.string().min(6).max(128).required(), // TODO: May be 64
  }),
};
export const resetPassword = () => async (req: Request, res: Response): Promise<void> => {
  const {
    params: { id: userId },
    body: { password },
  } = req;

  const mongoConn = getConnection('mongodb');
  const usersRepo = mongoConn.getMongoRepository(MongoUsers);
  const user = await usersRepo.findOneOrFail({ where: { id: userId } });

  user.password = await hashPassword(password);

  await usersRepo.save(user || {});
  // await getConnection().queryResultCache?.remove(getAllDetailCacheKeys('user', userId));

  res.sendStatus(204);
};

export const updatePasswordValidation = {
  body: Joi.object({
    email: Joi.string().lowercase().max(255).email().required(),
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required(),
  }),
};
export const updatePassword = () => async (req: Request, res: Response): Promise<void> => {
  const service = new UpdatePasswordService();
  const result = await service.execute(req.body);
  res.json(result);
  // eslint-disable-next-line prettier/prettier
};

export const getAllUsersByAdminValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(40).default(20),
    sort: Joi.string().valid('ASC', 'DESC').default('DESC'),
    sortBy: Joi.string().valid('createdAt', 'updatedAt').default('createdAt'),
    name: Joi.string().allow(''),
  }),
};
export const getAllUsersByAdmin = () => async (req: Request, res: Response): Promise<void> => {
  const {
    query: { page, perPage, sort, sortBy, name },
  } = req;

  const mongoConn = getConnection('mongodb');

  const usersRepo = mongoConn.getMongoRepository(MongoUsers);

  const limit = Number(perPage);
  const offset = (Number(page) - 1) * limit;

  // let where: FindConditions<MongoUsers>;

  // if (name && name !== '') {
  //   where = { ...where, username: { $regex: name} ;
  // }

  const [totalUsers, totalUsersCount] = await usersRepo.findAndCount({
    where: {
      username: { $regex: name },
      type: 'user',
    },
    take: limit,
    skip: offset,
    order: { [sortBy as string]: sort },
    select: ['email', 'username', 'type', 'address', 'general', 'contact'],
  });

  res.status(200).json({ totalUsers, totalUsersCount });
};

export const createUserByAdminValidation = {
  body: Joi.object({
    email: Joi.string().max(255).lowercase().email().required(),
    password: Joi.string().min(6).max(128).required(), // TODO: May be 64
    type: Joi.string()
      .valid(...Object.values(UserType))
      .required(),
  }),
};
export const createUserByAdmin = () => async (req: Request, res: Response): Promise<void> => {
  const {
    body: { email, password, type },
  } = req;

  const mongoConn = getConnection('mongodb');
  const usersRepo = mongoConn.getMongoRepository(MongoUsers);

  const existingUser = await usersRepo.findOne({ email });

  if (existingUser) {
    throw new BadRequestError('Email address already used', 'EMAIL_ALREADY_EXIST');
  }

  const hashedPassword = await hashPassword(password);

  let user = usersRepo.create({
    id: generateRandomHex(10),
    email,
    password: hashedPassword,
    type,
    assignedInventory: [],
    address: {},
    general: {},
    contact: {},
    avatar: '',
  });

  user = await usersRepo.save(user);
  const { password: _, ...userInfo } = user;

  res.status(201).json(userInfo);
};
