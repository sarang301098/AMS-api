import { getConnection } from 'typeorm';
import { Request, Response } from 'express';
import { Joi } from 'express-validation';
import { sumBy, countBy } from 'lodash';

import { BrandDetail as MongoBrandDetail } from '../model/mongo/BrandDetail';
import { ModelDetail as MongoModelDetail } from '../model/mongo/ModelDetail';
import { InventoryMaster as MongoInventoryMaster } from '../model/mongo/InventoryMaster';
import { InventoryDetail as MongoInventoryDetail } from '../model/mongo/InventoryDetail';
import { Users as MongoUsers } from '../model/mongo/users';
import { InventoryName as MongoInventoryName } from '../model/mongo/InventoryName';
import { RequestMaster as MongoRequest } from '../model/mongo/RequestMaster';

type assignInventory = {
  inventoryName: string | null;
  inventoryDetailId: string | null;
};

export const getAdminDashboardValidation = {
  query: Joi.object({}),
};
export const getAdminDashboard = () => async (req: Request, res: Response): Promise<void> => {
  const mongoConn = getConnection('mongodb');
  const brandsRepo = mongoConn.getMongoRepository(MongoBrandDetail);
  const modelRepo = mongoConn.getMongoRepository(MongoModelDetail);
  const inventoryMasterRepo = mongoConn.getMongoRepository(MongoInventoryMaster);
  const inventoryNameRepo = mongoConn.getMongoRepository(MongoInventoryName);
  const requestRepo = mongoConn.getMongoRepository(MongoRequest);

  const [inventoryNamesData] = await inventoryNameRepo.findAndCount({});

  const adminDashboardInventory = await Promise.all(
    (inventoryNamesData || []).map(async (inventoryNames: MongoInventoryName) => {
      return {
        inventoryName: inventoryNames?.name,

        availableUnits:
          sumBy(
            await inventoryMasterRepo.find({
              where: {
                inventoryName: inventoryNames?.name,
              },
            }),
            'availableUnits',
          ) || 0,

        totalUnits:
          sumBy(
            await inventoryMasterRepo.find({
              where: {
                inventoryName: inventoryNames?.name,
              },
            }),
            'totalUnits',
          ) || 0,

        assignedUnits:
          sumBy(
            await inventoryMasterRepo.find({
              where: {
                inventoryName: inventoryNames?.name,
              },
            }),
            'assignedUnits',
          ) || 0,
      };
    }),
  );

  const [, totalBrandCount] = await brandsRepo.findAndCount({});
  const [, totalModelCount] = await modelRepo.findAndCount({});

  const adminDashboardRequest = countBy(await requestRepo.find({}), 'status');

  res
    .status(200)
    .json({ adminDashboardInventory, totalBrandCount, totalModelCount, adminDashboardRequest });
};

export const getUserDashboardValidation = {
  params: Joi.object({
    userId: Joi.string().required(),
  }),
};
export const getUserDashboard = () => async (req: Request, res: Response): Promise<void> => {
  const {
    params: { userId },
  } = req;

  const mongoConn = getConnection('mongodb');
  const brandsRepo = mongoConn.getMongoRepository(MongoBrandDetail);
  const modelRepo = mongoConn.getMongoRepository(MongoModelDetail);
  const inventoryMasterRepo = mongoConn.getMongoRepository(MongoInventoryMaster);
  const inventoryDetailRepo = mongoConn.getMongoRepository(MongoInventoryDetail);
  const usersRepo = mongoConn.getMongoRepository(MongoUsers);
  const requestRepo = mongoConn.getMongoRepository(MongoRequest);

  const userData = await usersRepo.findOne(userId);
  const { assignedInventory } = userData || {};

  const userDashboardInventory = await Promise.all(
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

  const userDashboardRequest = countBy(
    await requestRepo.find({ where: { fromUserId: userId } }),
    'status',
  );

  res.status(200).json({ userDashboardInventory, userDashboardRequest });
};
