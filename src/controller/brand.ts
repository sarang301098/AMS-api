import { getConnection } from 'typeorm';
import { Request, Response } from 'express';
import { Joi } from 'express-validation';
import { map, uniqBy } from 'lodash';

import { BadRequestError } from '../error';
import { BrandDetail as MongoBrandDetail } from '../model/mongo/BrandDetail';
import { NotificationMaster as MongoNotificationMaster } from '../model/mongo/NotificationMaster';
import { InventoryMaster as MongoInventoryMaster } from '../model/mongo/InventoryMaster';
import { ModelDetail as MongoModelDetail } from '../model/mongo/ModelDetail';
import { ObjectID } from 'mongodb';

type Options = {
  value: string | null;
  label: string | null;
};

const generateNotificationMessage = (name: string) => {
  return `Brand ${name} added Successfully`;
};

export const getBrandOptionsValidation = {
  query: Joi.object({
    q: Joi.string().allow(null),
  }),
};
export const getBrandOptions = () => async (req: Request, res: Response): Promise<void> => {
  const mongoConn = getConnection('mongodb');
  const brandsRepo = mongoConn.getMongoRepository(MongoBrandDetail);

  const [brandOptions, brandOptionsCount] = await brandsRepo.findAndCount({});
  let UpdatedBrandOptions: Array<Options> = [];

  if (brandOptions && brandOptionsCount) {
    UpdatedBrandOptions = (brandOptions || []).map((brand) => ({
      value: brand?._id.toString(),
      label: brand?.name,
    }));
  }

  res.status(200).json({ brandOptions: UpdatedBrandOptions, brandOptionsCount });
};

export const createBrandValidation = {
  body: Joi.object({
    name: Joi.string(),
  }),
};
export const createBrand = () => async (req: Request, res: Response): Promise<void> => {
  const {
    user,
    body: { name },
  } = req;

  const mongoConn = getConnection('mongodb');
  const brandsRepo = mongoConn.getMongoRepository(MongoBrandDetail);
  const notificationRepo = mongoConn.getMongoRepository(MongoNotificationMaster);

  const existingBrand = await brandsRepo.findOne({ name });

  if (existingBrand) {
    throw new BadRequestError('Brand already Exist', 'BRAND_ALREADY_EXIST');
  }

  const newBrand = Object.assign({}, req.body || {});

  let brand = brandsRepo.create(newBrand);
  brand = await brandsRepo.save(brand);

  if (brand) {
    const notification = notificationRepo.create({
      fromId: (user?._id).toString(),
      isRead: false,
      description: generateNotificationMessage(name),
      isCreatedByAdmin: true,
      createdAt: new Date(),
    });
    await notificationRepo.save(notification);
  }

  res.status(200).json(brand);
};

export const deleteBrandValidation = {
  params: Joi.object({ id: Joi.string().required() }),
};
export const deleteBrand = () => async (req: Request, res: Response): Promise<void> => {
  const {
    params: { id },
  } = req;

  const mongoConn = getConnection('mongodb');
  const brandsRepo = mongoConn.getMongoRepository(MongoBrandDetail);
  const modelRepo = mongoConn.getMongoRepository(MongoModelDetail);

  const existingBrand = await brandsRepo.findOneOrFail({ where: { _id: new ObjectID(id) } });

  if (!existingBrand) {
    throw new BadRequestError('Brand not Available', 'BRAND_NOT_EXIST');
  }

  if (existingBrand) {
    await brandsRepo.delete(existingBrand);
    await modelRepo.deleteMany({ brandId: (existingBrand?._id).toString() });
    res.status(200).json('Brands and Models are Deleted Successfully');
  } else {
    res.status(400).json('Something went wrong');
  }
};

export const getBrandOptionsByInventoryNameValidation = {
  query: Joi.object({
    inventoryName: Joi.string().required(),
  }),
};
export const getBrandOptionsByInventoryName = () => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    query: { inventoryName },
  } = req;

  const mongoConn = getConnection('mongodb');
  const brandsRepo = mongoConn.getMongoRepository(MongoBrandDetail);
  const inventoryMasterRepo = mongoConn.getMongoRepository(MongoInventoryMaster);

  const filteredInventoryMasterData = (
    (await inventoryMasterRepo.find({ where: { inventoryName } })) || []
  ).filter((inventoryMastersData) => inventoryMastersData?.availableUnits > 0);

  const availableBrandsId = map(uniqBy(filteredInventoryMasterData, 'brandId'), 'brandId');

  const brandOptions = await brandsRepo.find({
    where: {
      _id: { $in: (availableBrandsId || []).map((brandId) => new ObjectID(brandId || '')) },
    },
  });

  let UpdatedBrandOptions: Array<Options> = [];

  if (brandOptions && brandOptions.length) {
    UpdatedBrandOptions = (brandOptions || []).map((brand) => ({
      value: brand?._id.toString(),
      label: brand?.name,
    }));
  }

  res.status(200).json({ brandOptions: UpdatedBrandOptions });
};
