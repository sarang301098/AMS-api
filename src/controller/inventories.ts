import { getConnection } from 'typeorm';
import { Request, Response } from 'express';
import { Joi } from 'express-validation';
import { InventoryDetailRepository } from '../repository/InventoryList';
import { InventoryMasterRepository } from '../repository/AvailableInventory';
import { MongoUsersRepository } from '../repository/Mongousers';
import { InventoryAssignedDetailRepository } from '../repository/Inventories';
import { RequestRepository } from '../repository/Requests';
import { BadRequestError } from '../error';

import { InventoryAssignedDetail } from '../model/mongo/InventoryAssignedDetail';
import { NotificationMaster } from '../model/mongo/NotificationMaster';
import { BrandDetail as MongoBrandDetail } from '../model/mongo/BrandDetail';
import { ModelDetail as MongoModelDetail } from '../model/mongo/ModelDetail';

import { ObjectID } from 'mongodb';
import { Users } from '../model/mongo/users';
import { InventoryMaster } from '../model/mongo/InventoryMaster';

type assignInventory = {
  inventoryName: string | null;
  inventoryDetailId: string | null;
};

const generateNotificationMessage = (
  fromUserName: string,
  toUserName: string,
  inventoryName: string,
) => {
  return `Inventory ${inventoryName} Successfully Assigned to ${toUserName} by ${fromUserName}`;
};

export type assignInventoryData = {
  inventoryName: string | null;
  inventoryDetailId: string | null;
};

export const getInventoryByUserIdValidation = {
  params: Joi.object({
    userId: Joi.string().required(),
  }),
};
export const getInventoryByUserId = () => async (req: Request, res: Response): Promise<void> => {
  const {
    params: { userId },
  } = req;

  const mongoConn = getConnection('mongodb');
  const brandsRepo = mongoConn.getMongoRepository(MongoBrandDetail);
  const modelRepo = mongoConn.getMongoRepository(MongoModelDetail);
  const inventoryMasterRepo = mongoConn.getCustomRepository(InventoryMasterRepository);
  const inventoryDetailRepo = mongoConn.getCustomRepository(InventoryDetailRepository);
  const usersRepo = mongoConn.getCustomRepository(MongoUsersRepository);

  const userData = await usersRepo.findOne(userId);
  const { assignedInventory } = userData || {};

  if (assignedInventory && assignedInventory.length < 1) {
    throw new BadRequestError('This User has no inventories', 'INVENTORIES_NOT_ASSIGNED');
  }
  const requestWithUserData = await Promise.all(
    (assignedInventory || []).map(async (data: assignInventory) => {
      const inventoryDetailData = await inventoryDetailRepo.findOne(data?.inventoryDetailId || '');
      const inventoryMasterData = await inventoryMasterRepo.findOne(inventoryDetailData?._id);
      return {
        inventoryName: data?.inventoryName || 'N/A',
        label: inventoryDetailData?.label || 'N/A',
        assignedAt: inventoryDetailData?.updatedAt,
        brandName: ((await brandsRepo.findOne(inventoryMasterData?.brandId || '')) || {}).name,
        modelName: ((await modelRepo.findOne(inventoryMasterData?.modelId || '')) || {}).name,
      };
    }),
  );

  res.status(200).json(requestWithUserData);
};

export const getInventoryByInventoryIdValidation = {
  params: Joi.object({
    inventoryListId: Joi.string().required(),
  }),
};
export const getInventoryByInventoryId = () => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const mongoConn = getConnection('mongodb');
  const inventoryRepo = mongoConn.getCustomRepository(InventoryAssignedDetailRepository);
  const [inventory, count] = await inventoryRepo.findAndCount();
  res.status(200).json({ inventory, count });
};

export const getAvailableInventoryDetailValidation = {
  query: Joi.object({
    brandId: Joi.string().required(),
    modelId: Joi.string().required(),
    inventoryName: Joi.string().required(),
  }),
};
export const getAvailableInventoryDetailsData = () => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    query: { brandId, modelId, inventoryName },
  } = req;

  const mongoConn = getConnection('mongodb');
  const inventoryDetailRepo = mongoConn.getCustomRepository(InventoryDetailRepository);
  const inventoryMasterRepo = mongoConn.getCustomRepository(InventoryMasterRepository);
  let inventoryDetailData;

  const inventoryMasterData = await inventoryMasterRepo.findOneOrFail({
    where: { brandId, modelId, inventoryName },
  });

  if (inventoryMasterData && inventoryMasterData.availableUnits) {
    inventoryDetailData = await inventoryDetailRepo.findOneOrFail({
      where: { inventoryId: `${inventoryMasterData?._id}`, isAssigne: false },
    });

    if (!inventoryDetailData) {
      throw new BadRequestError('Inventory Not Available', 'INVENTORY_NOT_AVAILABLE');
    }
  }

  res.status(200).json(inventoryDetailData);
};

export const AssignInventoryNewValidation = {
  body: Joi.object({
    inventoryDetailId: Joi.string(),
    requestId: Joi.string(),
  }),
};
export const AssignInventoryNew = () => async (req: Request, res: Response): Promise<void> => {
  const {
    user,
    body: { inventoryDetailId, requestId },
  } = req;

  const mongoConn = getConnection('mongodb');
  const inventoryDetailRepo = mongoConn.getCustomRepository(InventoryDetailRepository);
  const inventoryAssignedDetailRepo = mongoConn.getMongoRepository(InventoryAssignedDetail);
  const inventoryMasterRepo = mongoConn.getCustomRepository(InventoryMasterRepository);
  const requestRepo = mongoConn.getCustomRepository(RequestRepository);
  const usersRepo = mongoConn.getCustomRepository(MongoUsersRepository);
  const notificationRepo = mongoConn.getMongoRepository(NotificationMaster);

  let userData: Users | undefined;
  let inventoryMasterData: InventoryMaster | undefined;
  let isNew = true;

  let request = await requestRepo.findOne(requestId);
  let inventoryDetailData = await inventoryDetailRepo.findOne(inventoryDetailId);

  if (request && request?.status === 'completed') {
    throw new BadRequestError('Request Already Completed', 'REQUEST_ALREADY_COMPLETED');
  }

  if (inventoryDetailData && inventoryDetailData.inventoryId) {
    inventoryMasterData = await inventoryMasterRepo.findOne(inventoryDetailData?.inventoryId);
  }
  if (request && request.fromUserId) {
    userData = await usersRepo.findOne(request?.fromUserId);
  }

  if (inventoryDetailData && request && inventoryMasterData && !inventoryDetailData.isAssigne) {
    const inventoryAssignedDetailDataCreate = await inventoryAssignedDetailRepo.create({
      inventoryDetailId: (inventoryDetailData?._id).toString(),
      assignedUserId: request?.fromUserId,
      isPreviouslyUsed: false,
      createdAt: new Date(),
    });
    await inventoryAssignedDetailRepo.save(inventoryAssignedDetailDataCreate);

    let assignInventoryObject: {
      inventoryName: string | null;
      inventoryDetailId: string | null;
    } = {
      inventoryName: null,
      inventoryDetailId: null,
    };
    let oldInventoryDetailId;

    (userData?.assignedInventory || []).map(async (inventory: assignInventory) => {
      if (inventory.inventoryName === inventoryMasterData?.inventoryName) {
        oldInventoryDetailId = inventory.inventoryDetailId;
        inventory.inventoryDetailId = (inventoryDetailData?._id || '').toString();
        assignInventoryObject = inventory;
        isNew = false;
        await usersRepo.save(userData || {});
      }
    });

    if (!assignInventoryObject?.inventoryName) {
      userData?.assignedInventory.push({
        inventoryName: inventoryMasterData?.inventoryName,
        inventoryDetailId: (inventoryDetailData?._id).toString(),
      });
      await usersRepo.save(userData || {});
    }

    if (inventoryMasterData && inventoryMasterData.availableUnits && isNew) {
      inventoryMasterData.availableUnits -= 1;
      inventoryMasterData.assignedUnits += 1;
      await inventoryMasterRepo.save(inventoryMasterData);
    }

    inventoryDetailData = Object.assign({}, inventoryDetailData, { isAssigne: true });
    await inventoryDetailRepo.save(inventoryDetailData);

    if (!isNew) {
      await inventoryDetailRepo.update(
        { _id: new ObjectID(oldInventoryDetailId) },
        { isAssigne: false },
      );
    }

    const notification = notificationRepo.create({
      fromId: (user?._id).toString(),
      isRead: false,
      description: generateNotificationMessage(
        user?.username || '',
        userData?.username || '',
        inventoryMasterData?.inventoryName || '',
      ),
      isCreatedByAdmin: true,
      createdAt: new Date(),
    });
    await notificationRepo.save(notification);

    request = Object.assign({}, request, { status: 'completed' });
    await requestRepo.save(request);
  } else {
    throw new BadRequestError('Inventory Already Assigned', 'INVENTORY_ALREADY_ASSIGNED');
  }

  res.status(200).json({ request });
};
