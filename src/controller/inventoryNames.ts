import { getConnection } from 'typeorm';
import { Request, Response } from 'express';
import { Joi } from 'express-validation';

import { BadRequestError } from '../error';
import { InventoryName as MongoInventoryName } from '../model/mongo/InventoryName';
import { NotificationMaster as MongoNotificationMaster } from '../model/mongo/NotificationMaster';
import { ObjectID } from 'mongodb';

type Options = {
  value: string | null;
  label: string | null;
};

const generateNotificationMessage = (name: string) => {
  return `New Inventory: "${name}" added Successfully`;
};

const generateNotificationDeleteMessage = (name: string | null) => {
  return `Inventory: "${name}" removed Successfully`;
};

export const getInventoryNameOptionsValidation = {
  query: Joi.object({
    q: Joi.string().allow(null),
  }),
};
export const getInventoryNameOptions = () => async (req: Request, res: Response): Promise<void> => {
  const mongoConn = getConnection('mongodb');
  const inventoryNameRepo = mongoConn.getMongoRepository(MongoInventoryName);

  const [inventoryNameOptions, inventoryNameOptionsCount] = await inventoryNameRepo.findAndCount(
    {},
  );
  let UpdatedInventoryNameOptions: Array<Options> = [];

  if (inventoryNameOptions && inventoryNameOptionsCount) {
    UpdatedInventoryNameOptions = (inventoryNameOptions || []).map((inventoryNameData) => ({
      value: inventoryNameData?._id.toString(),
      label: inventoryNameData?.name,
    }));
  }

  res
    .status(200)
    .json({ inventoryNameOptions: UpdatedInventoryNameOptions, inventoryNameOptionsCount });
};

export const createInventoryNameValidation = {
  body: Joi.object({
    name: Joi.string().required(),
  }),
};
export const createInventoryName = () => async (req: Request, res: Response): Promise<void> => {
  const {
    user,
    body: { name },
  } = req;

  const mongoConn = getConnection('mongodb');
  const inventoryNameRepo = mongoConn.getMongoRepository(MongoInventoryName);
  const notificationRepo = mongoConn.getMongoRepository(MongoNotificationMaster);

  const existingInventoryName = await inventoryNameRepo.findOne({ name });

  if (existingInventoryName) {
    throw new BadRequestError('Inventory name already Exist', 'INVENTORYNAME_ALREADY_EXIST');
  }

  const newInventoryName = Object.assign({}, req.body || {});

  let inventoryNameData = inventoryNameRepo.create(newInventoryName);
  inventoryNameData = await inventoryNameRepo.save(inventoryNameData);

  if (inventoryNameData) {
    const notification = notificationRepo.create({
      fromId: (user?._id).toString(),
      isRead: false,
      description: generateNotificationMessage(name),
      isCreatedByAdmin: true,
      createdAt: new Date(),
    });
    await notificationRepo.save(notification);
  }

  res.status(200).json(inventoryNameData);
};

export const deleteInventoryNameValidation = {
  params: Joi.object({ id: Joi.string().required() }),
};
export const deleteInventoryName = () => async (req: Request, res: Response): Promise<void> => {
  const {
    user,
    params: { id },
  } = req;

  const mongoConn = getConnection('mongodb');
  const inventoryNameRepo = mongoConn.getMongoRepository(MongoInventoryName);
  const notificationRepo = mongoConn.getMongoRepository(MongoNotificationMaster);

  const inventoryNameData = await inventoryNameRepo.findOneOrFail({
    where: { _id: new ObjectID(id) },
  });

  if (!inventoryNameData) {
    throw new BadRequestError('Inventory Name not Available', 'INVENTORYNAME_NOT_EXIST');
  }

  if (inventoryNameData) {
    const notification = notificationRepo.create({
      fromId: (user?._id).toString(),
      isRead: false,
      description: generateNotificationDeleteMessage(inventoryNameData?.name),
      isCreatedByAdmin: true,
      createdAt: new Date(),
    });
    await notificationRepo.save(notification);
  }

  if (inventoryNameData) {
    await inventoryNameRepo.delete(inventoryNameData);
    res.status(200).json('Inventory Name Deleted Successfully');
  } else {
    res.status(400).json('Something went wrong');
  }
};
