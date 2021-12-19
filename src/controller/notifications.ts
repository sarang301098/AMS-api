import { getConnection, FindConditions } from 'typeorm';
import { Request, Response } from 'express';
import { Joi } from 'express-validation';
import { ObjectId } from 'mongodb';

import { NotificationRepository } from '../repository/Notifications';
import { NotificationMaster } from '../model/mongo/NotificationMaster';

export const getNotificationByUsersValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(40).default(20),
    sort: Joi.string().valid('ASC', 'DESC').default('DESC'),
    sortBy: Joi.string()
      .valid('inventoryId', 'status', 'createdAt', 'updatedAt')
      .default('createdAt'),
  }),
};

export const getNotificationList = () => async (req: Request, res: Response): Promise<void> => {
  const { page, perPage, sort, sortBy } = req.query;
  const mongoConn = getConnection('mongodb');
  const notificationRepo = mongoConn.getCustomRepository(NotificationRepository);

  const limit = Number(perPage);
  const offset = (Number(page) - 1) * limit;

  const [notifications, notificationCount] = await notificationRepo.findAndCount({
    take: limit,
    skip: offset,
    order: { [sortBy as string]: sort },
  });

  res.status(200).json({ notificationCount, notifications });
};
export const getNotificationByUserIdValidation = {
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(40).default(20),
    sort: Joi.string().valid('ASC', 'DESC').default('DESC'),
    sortBy: Joi.string()
      .valid('inventoryName', 'status', 'createdAt', 'updatedAt')
      .default('createdAt'),
    isRead: Joi.string().valid('yes', 'no', 'all').default('all'),
  }),
};
export const getNotificationByUserId = () => async (req: Request, res: Response): Promise<void> => {
  const {
    params: { id },
    query: { page, perPage, sort, sortBy, isRead },
  } = req;

  let where: FindConditions<NotificationMaster> = {};

  if (id) {
    where = { ...where, fromId: id };
  }
  if (isRead === 'yes') {
    where = { ...where, isRead: true };
  }
  if (isRead === 'no') {
    where = { ...where, isRead: false };
  }

  const mongoConn = getConnection('mongodb');
  const notificationRepo = mongoConn.getCustomRepository(NotificationRepository);

  const limit = Number(perPage);
  const offset = (Number(page) - 1) * limit;

  const [, unvisitedCount] = await notificationRepo.findAndCount({
    where: { ...where, isRead: false },
  });

  const [totalNotifications, totalNotificationCountTotal] = await notificationRepo.findAndCount({
    where,
    take: limit,
    skip: offset,
    order: { [sortBy as string]: sort },
  });

  // { VisitedNotificationCount, visited, unvisitedCount, unvisited }
  res.status(200).json({ totalNotifications, totalNotificationCountTotal, unvisitedCount });
};

export const getNotificationByIdValidation = {
  params: Joi.object({ notificationId: Joi.string().required() }),
};
export const getNotificationByNotificationId = () => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    params: { notificationId },
  } = req;

  const mongoConn = getConnection('mongodb');
  const notificationRepo = mongoConn.getCustomRepository(NotificationRepository);
  const notification = await notificationRepo.findOne(notificationId);

  res.status(200).json({ notification });
};

export const getNotificationByAdminValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(40).default(20),
    sort: Joi.string().valid('ASC', 'DESC').default('DESC'),
    sortBy: Joi.string()
      .valid('inventoryName', 'status', 'createdAt', 'updatedAt')
      .default('createdAt'),
    isRead: Joi.string().valid('yes', 'no', 'all').default('all'),
  }),
};
export const getNotificationByAdmin = () => async (req: Request, res: Response): Promise<void> => {
  const {
    query: { page, perPage, sort, sortBy, isRead },
  } = req;

  const mongoConn = getConnection('mongodb');
  const notificationRepo = mongoConn.getCustomRepository(NotificationRepository);

  const limit = Number(perPage);
  const offset = (Number(page) - 1) * limit;

  let where: FindConditions<NotificationMaster> = {};
  where = { ...where, isCreatedByAdmin: true };

  if (isRead === 'yes') {
    where = { ...where, isRead: true };
  }
  if (isRead === 'no') {
    where = { ...where, isRead: false };
  }

  const [totalNotifications, totalNotificationCount] = await notificationRepo.findAndCount({
    where,
    take: limit,
    skip: offset,
    order: { [sortBy as string]: sort },
  });

  const [, unvisitedCount] = await notificationRepo.findAndCount({
    where: { ...where, isRead: false },
  });

  res.status(200).json({ totalNotifications, totalNotificationCount, unvisitedCount });
};

// Delete All Notifications By Id array
export const deleteNotificationsValidation = {
  body: Joi.object({ ids: Joi.array() }),
};
export const deleteNotifications = () => async (req: Request, res: Response): Promise<void> => {
  const {
    body: { ids },
  } = req;

  const mongoConn = getConnection('mongodb');
  const notificationRepo = mongoConn.getMongoRepository(NotificationMaster);

  const deletedNotificationData = await notificationRepo.deleteMany({
    _id: { $in: ids.map((id: string) => new ObjectId(id)) },
  });

  res.status(200).json({ deletedCount: (deletedNotificationData || {}).deletedCount });
};

export const deleteNotificationValidation = {
  params: Joi.object({ id: Joi.string().required() }),
};
export const deleteNotificationById = () => async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const mongoConn = getConnection('mongodb');
  const notificationRepo = mongoConn.getMongoRepository(NotificationMaster);

  const notification = await notificationRepo.findOne(id);

  if (!notification) {
    res.status(400).json(`Notification ${id} not Found`);
  }

  const deletedData = await notificationRepo.deleteOne({ _id: new ObjectId(id) });

  if (deletedData && deletedData.deletedCount) {
    res.status(200).json('Notification deleted successfully');
  } else {
    res.status(400).json(`Error while delete Notification ${id}`);
  }
};

export const updateVisitedNotificationValidation = {
  body: Joi.object({
    ids: Joi.array(),
    isRead: Joi.boolean(),
  }),
};
export const updateVisitedNotification = () => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { ids, isRead } = req.body;

  const mongoConn = getConnection('mongodb');
  const notificationRepo = mongoConn.getMongoRepository(NotificationMaster);

  await notificationRepo.updateMany(
    { _id: { $in: ids.map((id: string) => new ObjectId(id)) } },
    { $set: { isRead } },
  );

  res.sendStatus(204);
};
