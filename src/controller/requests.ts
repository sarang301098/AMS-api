import { getConnection, FindConditions, In } from 'typeorm';
import { Request, Response } from 'express';
import { Joi } from 'express-validation';
import * as _ from 'lodash';

import { RequestRepository } from '../repository/Requests';
import { RequestMaster as MongoRequest } from '../model/mongo/RequestMaster';
import { RequestStatus } from '../constants';
import { NotificationRepository } from '../repository/Notifications';
import { Users as MongoUsers } from '../model/mongo/users';
import { NotificationMaster } from '../model/mongo/NotificationMaster';
import { ObjectID } from 'mongodb';

const generateNotificationMessage = (status: string) => {
  return `Request's status has been changed as ${status}`;
};

/**
 * Create Request
 */
export const createRequestValidation = {
  body: Joi.object({
    descriptionNote: Joi.string().max(255).required(),
    priority: Joi.string().max(255).lowercase().required(),
    inventoryName: Joi.string().required(),
  }),
};
export const createRequest = () => async (req: Request, res: Response): Promise<void> => {
  const {
    user,
    body: { descriptionNote, priority, inventoryName },
  } = req;

  const mongoConn = getConnection('mongodb');
  const requestRepo = mongoConn.getMongoRepository(MongoRequest);
  const notificationRepo = mongoConn.getMongoRepository(NotificationMaster);

  let request = requestRepo.create({
    fromUserId: `${user?._id}`,
    inventoryName,
    descriptionNote,
    priority,
    status: RequestStatus.PENDING,
  });

  request = await requestRepo.save(request);

  let newNotification;
  if (request && request._id) {
    const notification = notificationRepo.create({
      fromId: (user?._id).toString(),
      isRead: false,
      description: request.descriptionNote,
      isCreatedByAdmin: false,
      createdAt: new Date(),
    });
    newNotification = await notificationRepo.save(notification);
  }

  res.status(201).json({ request, newNotification });
};

export const getAdminRequestListValidation = {
  query: Joi.object({
    status: Joi.string(), // .valid(...Object.values(RequestStatus)),
    inventoryId: Joi.string(),
    priority: Joi.string(),
    userName: Joi.string().allow(''),
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(40).default(20),
    sort: Joi.string().valid('ASC', 'DESC').default('DESC'),
    sortBy: Joi.string().valid('status', 'createdAt', 'updatedAt').default('createdAt'),
  }),
};
export const getAdminRequestList = () => async (req: Request, res: Response): Promise<void> => {
  const {
    query: { status, page, perPage, sort, sortBy, inventoryId, priority, userName },
  } = req;

  const mongoConn = getConnection('mongodb');
  const requestRepo = mongoConn.getCustomRepository(RequestRepository);
  const usersRepo = mongoConn.getMongoRepository(MongoUsers);
  let userIds: Array<string> = [];
  let where: FindConditions<MongoRequest> = {};

  if (userName && userName !== '') {
    const userData = await usersRepo.find({
      where: { type: 'user' }, // username: new RegExp(userName, 'ig')
      select: ['username'],
    });

    if (userData && userData.length) {
      userIds = [...new Set((userData || []).map((obj) => obj?._id.toString()))]; // (uniqBy(data, '_id') || []).map((userData) => userData?._id.toString());
    }
    where = { ...where, fromUserId: In(userIds || []) };
  }

  if (status && status !== 'all') {
    where = { ...where, status: `${status}` };
  }
  if (inventoryId) {
    where = { ...where, inventoryId: `${inventoryId}` };
  }
  if (priority) {
    where = { ...where, priority: `${priority}` };
  }

  const limit = Number(perPage);
  const offset = (Number(page) - 1) * limit;
  const [requests, count] = await requestRepo.findAndCount({
    where,
    take: limit,
    skip: offset,
    order: { [sortBy as string]: sort },
  });

  const requestWithUserData = await Promise.all(
    (requests || []).map(async (request: MongoRequest) => {
      return {
        ...request,
        userData: await usersRepo.findOneOrFail({
          where: { _id: new ObjectID(request?.fromUserId || '') },
          select: ['username', 'general'],
        }),
      };
    }),
  );

  res.status(200).json({ requests: requestWithUserData, count });
};

/**
 * Get Requests
 */
export const getRequestValidation = {
  query: Joi.object({
    q: Joi.string().max(50),
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(40).default(20),
    sort: Joi.string().valid('ASC', 'DESC').default('DESC'),
    sortBy: Joi.string().valid('status', 'createdAt', 'updatedAt').default('createdAt'),
  }),
};
export const getAll = () => async (req: Request, res: Response): Promise<void> => {
  const {
    user,
    query: { q, page, perPage, sort, sortBy },
  } = req;

  const mongoConn = getConnection('mongodb');
  const requestRepo = mongoConn.getCustomRepository(RequestRepository);

  let where: FindConditions<MongoRequest> = {};
  if (user) {
    where = { ...where, fromUserId: `${user._id}` };
  }
  if (q) {
    where = { ...where, inventoryId: `${q}` };
  }

  const limit = Number(perPage);
  const offset = (Number(page) - 1) * limit;
  const [requests, count] = await requestRepo.findAndCount({
    where,
    take: limit,
    skip: offset,
    order: { [sortBy as string]: sort },
  });

  res.status(200).json({ count, requests });
};

/**
 * Get All request list of user (Pagination and Filters)
 */
export const getUserRequestValidation = {
  query: Joi.object({
    q: Joi.string().max(50),
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(40).default(20),
    sort: Joi.string().valid('ASC', 'DESC').default('DESC'),
    sortBy: Joi.string().valid('status', 'createdAt', 'updatedAt').default('createdAt'),
    status: Joi.string().default('all'),
  }),
};
export const getUserAll = () => async (req: Request, res: Response): Promise<void> => {
  const {
    user,
    query: { q, page, perPage, sort, sortBy, status },
  } = req;

  const mongoConn = getConnection('mongodb');
  const requestRepo = mongoConn.getCustomRepository(RequestRepository);
  let where: FindConditions<MongoRequest> = {};

  if (q) {
    where = { ...where, inventoryId: `${q}` };
  }
  if (status && status !== 'all') {
    where = { ...where, status: `${status}` };
  }
  if (user && user._id) {
    where = { ...where, fromUserId: `${user._id}` };
  }

  const limit = Number(perPage);
  const offset = (Number(page) - 1) * limit;

  const [requests, count] = await requestRepo.findAndCount({
    where,
    take: limit,
    skip: offset,
    order: { [sortBy as string]: sort },
  });

  res.status(200).json({ count, requests });
};

/**
 * Get Single Request By Request Id
 */
export const getRequestByRequestIdValidation = {
  params: Joi.object({ id: Joi.string().required() }),
};
export const getRequestByRequestId = () => async (req: Request, res: Response): Promise<void> => {
  const {
    params: { id },
  } = req;
  const mongoConn = getConnection('mongodb');
  const requestRepo = mongoConn.getCustomRepository(RequestRepository);
  const request = await requestRepo.findOne(id);

  res.status(200).json(request);
};

/**
 * Delete Request By Id
 */
export const deleteRequestValidation = {
  params: Joi.object({ id: Joi.string().required() }),
};
export const deleteRequest = () => async (req: Request, res: Response): Promise<void> => {
  const {
    params: { id },
  } = req;

  const mongoConn = getConnection('mongodb');
  const requestRepo = mongoConn.getCustomRepository(RequestRepository);
  const requests = await requestRepo.findOne(id);

  if (requests && requests?.status === RequestStatus.PENDING) {
    requestRepo.delete(requests);
    res.status(200).json('requests deleted successfully');
  } else {
    res.status(400).json('Request is only allow to delete while in pending status');
  }
};

/**
 * Update Request
 */
export const updateRequestValidation = {
  params: Joi.object({ id: Joi.string().required() }),
  body: Joi.object({
    descriptionNote: Joi.string().max(255).required(),
    priority: Joi.string().max(255).lowercase().required(),
    inventoryId: Joi.string().max(255).lowercase().required(),
    status: Joi.string().valid(...Object.values(RequestStatus)),
  }),
};
export const updateRequest = () => async (req: Request, res: Response): Promise<void> => {
  const {
    params: { id },
    body: { inventoryId, descriptionNote, priority },
  } = req;

  const mongoConn = getConnection('mongodb');
  const requestRepo = mongoConn.getCustomRepository(RequestRepository);
  let request = await requestRepo.findOne(id);

  if (request && request?.status === RequestStatus.PENDING) {
    request = Object.assign({}, request, { inventoryId, descriptionNote, priority });
    await requestRepo.save(request);
    res.status(200).json(request);
  } else {
    res.status(400).json('Request not found');
  }
};

/**
 * Update Status By Admin
 */
export const AdminUpdateRequestValidation = {
  params: Joi.object({ id: Joi.string().required() }),
  body: Joi.object({
    status: Joi.string().valid(...Object.values(RequestStatus)),
  }),
};
export const AdminUpdateRequest = () => async (req: Request, res: Response): Promise<void> => {
  const {
    user,
    params: { id },
    body: { status },
  } = req;

  const mongoConn = getConnection('mongodb');
  const requestRepo = mongoConn.getCustomRepository(RequestRepository);
  const notificationRepo = mongoConn.getCustomRepository(NotificationRepository);

  const request = await requestRepo.findOne(id);

  if (request && request?.status) {
    request.status = status;
    await requestRepo.save(request);

    const notification = notificationRepo.create({
      toId: request?.fromUserId,
      fromId: (user?._id).toString(),
      isRead: false,
      description: generateNotificationMessage(status),
      isCreatedByAdmin: true,
      createdAt: new Date(),
    });

    const newNotification = await notificationRepo.save(notification);
    res.status(200).json({ request, newNotification });
  } else {
    res.status(400).json('Request not found');
  }
};
