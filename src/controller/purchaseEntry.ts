import { getConnection, FindConditions } from 'typeorm';
import { Request, Response } from 'express';
import { Joi } from 'express-validation';
import { ObjectID } from 'mongodb';

import { InventoryDetail } from '../model/mongo/InventoryDetail';
import { InventoryMaster } from '../model/mongo/InventoryMaster';
import { PurchaseEntry } from '../model/mongo/PurchaseEntry';
import { ModelDetail as MongoModelDetail } from '../model/mongo/ModelDetail';
import { BrandDetail as MongoBrandDetail } from '../model/mongo/BrandDetail';
import { NotificationMaster as MongoNotificationMaster } from '../model/mongo/NotificationMaster';

import { PurchaseEntryRepository } from '../repository/PurchaseEntry';

const generateNotificationMessage = (units: number, inventoryName: string) => {
  return `${units} units of ${inventoryName} were added Successfully`;
};

const generateInventoryLabel = (brandName: string, modelName: string, counter: number) => {
  return `${brandName.slice(0, 3)}/${modelName.slice(0, 3)}/${counter}`.toUpperCase();
};

export const createPurchaseEntryValidation = {
  body: Joi.object({
    brandId: Joi.string().required(),
    modelId: Joi.string().required(),
    units: Joi.number().required(),
    purchasedDate: Joi.date().default(new Date()),
    singleUnitAmount: Joi.number().required(),
    totalAmount: Joi.number().required(),
    inventoryName: Joi.string().required(),
  }),
};
export const createpurchaseEntry = () => async (req: Request, res: Response): Promise<void> => {
  const {
    user,
    body: { brandId, modelId, purchasedDate, units, singleUnitAmount, totalAmount, inventoryName },
  } = req;

  const mongoConn = getConnection('mongodb');
  const brandsRepo = mongoConn.getMongoRepository(MongoBrandDetail);
  const modelRepo = mongoConn.getMongoRepository(MongoModelDetail);
  const purchaseEntryRepo = mongoConn.getMongoRepository(PurchaseEntry);
  const inventoryDetailRepo = mongoConn.getMongoRepository(InventoryDetail);
  const InventoryMasterRepo = mongoConn.getMongoRepository(InventoryMaster);
  const notificationRepo = mongoConn.getMongoRepository(MongoNotificationMaster);

  let purchaseEntry, brand, model;

  if (brandId && modelId) {
    brand = await brandsRepo.findOneOrFail({ where: { _id: new ObjectID(brandId) } });
    model = await modelRepo.findOneOrFail({ where: { _id: new ObjectID(modelId) } });

    purchaseEntry = purchaseEntryRepo.create({
      brandId,
      modelId,
      purchasedDate,
      units,
      singleUnitAmount,
      totalAmount,
      inventoryName,
    });
  }

  if (purchaseEntry) {
    purchaseEntry = await purchaseEntryRepo.save(purchaseEntry);

    if (purchaseEntry) {
      let i = 0;

      let availableInventory = await InventoryMasterRepo.findOne({
        where: {
          brandId: purchaseEntry.brandId,
          modelId: purchaseEntry.modelId,
          inventoryName: purchaseEntry.inventoryName,
        },
      });

      if (availableInventory) {
        availableInventory.availableUnits += purchaseEntry.units;
        availableInventory.totalUnits += purchaseEntry.units;
        availableInventory = await InventoryMasterRepo.save(availableInventory);
      } else {
        availableInventory = InventoryMasterRepo.create({
          inventoryName: purchaseEntry.inventoryName,
          availableUnits: purchaseEntry.units,
          totalUnits: purchaseEntry.units,
          assignedUnits: 0,
          brandId: purchaseEntry.brandId,
          modelId: purchaseEntry.modelId,
        });
        availableInventory = await InventoryMasterRepo.save(availableInventory);
      }

      if (purchaseEntry.units) {
        const [, inventoryDetailCount] = await inventoryDetailRepo.findAndCount({});

        while (i < purchaseEntry?.units) {
          let inventoryDetail = inventoryDetailRepo.create({
            label: generateInventoryLabel(
              brand?.name || '',
              model?.name || '',
              Number(inventoryDetailCount + i + 1),
            ),
            inventoryId: (availableInventory?._id).toString(),
            isAssigne: false,
          });
          inventoryDetail = await inventoryDetailRepo.save(inventoryDetail);
          i++;
        }
      }
    }

    const notification = notificationRepo.create({
      fromId: (user?._id).toString(),
      isRead: false,
      description: generateNotificationMessage(units, inventoryName),
      isCreatedByAdmin: true,
      createdAt: new Date(),
    });
    await notificationRepo.save(notification);
  }
  res.status(201).json(purchaseEntry);
};

export const getPurchaseAllValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(40).default(20),
    sort: Joi.string().valid('ASC', 'DESC').default('DESC'),
    sortBy: Joi.string().valid('purchasedDate').default('purchasedDate'),
    inventoryName: Joi.string(),
  }),
};
export const getPurchaseAll = () => async (req: Request, res: Response): Promise<void> => {
  const {
    query: { page, perPage, sort, sortBy },
  } = req;

  const mongoConn = getConnection('mongodb');
  const purchaseEntryRepo = mongoConn.getCustomRepository(PurchaseEntryRepository);

  const limit = Number(perPage);
  const offset = (Number(page) - 1) * limit;
  const where: FindConditions<PurchaseEntry> = {};

  // if (inventoryName && inventoryName !== '') {
  //   where = { ...where, inventoryName: new RegExp(inventoryName as string, 'ig') };
  // }

  const [purchaseEntries, count] = await purchaseEntryRepo.findAndCount({
    where,
    take: limit,
    skip: offset,
    order: { [sortBy as string]: sort },
  });

  res.status(200).json({ purchaseEntries, count });
};
