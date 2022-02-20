import { getConnection } from 'typeorm';
import { Request, Response } from 'express';
import { Joi } from 'express-validation';
import { map, uniqBy } from 'lodash';

import { BadRequestError } from '../error';
import { ModelDetail as MongoModelDetail } from '../model/mongo/ModelDetail';
import { InventoryMaster as MongoInventoryMaster } from '../model/mongo/InventoryMaster';
import { ObjectID } from 'mongodb';

type Options = {
  value: string | null;
  label: string | null;
};

export const getModelOptionsValidation = {
  query: Joi.object({
    brandId: Joi.string().required(),
  }),
};
export const getModelOptions = () => async (req: Request, res: Response): Promise<void> => {
  const {
    query: { brandId },
  } = req;

  const mongoConn = getConnection('mongodb');
  const modelRepo = mongoConn.getMongoRepository(MongoModelDetail);

  const [modelOptions, modelOptionsCount] = await modelRepo.findAndCount({ where: { brandId } });
  let UpdatedModelOptions: Array<Options> = [];

  if (modelOptions && modelOptionsCount) {
    UpdatedModelOptions = modelOptions.map((model) => ({
      value: model?._id.toString(),
      label: model?.name,
    }));
  }

  res.status(200).json({ modelOptions: UpdatedModelOptions, modelOptionsCount });
};

export const createModelValidation = {
  body: Joi.object({
    name: Joi.string().required(),
    brandId: Joi.string().required(),
  }),
};
export const createModel = () => async (req: Request, res: Response): Promise<void> => {
  const {
    body: { name, brandId },
  } = req;

  const mongoConn = getConnection('mongodb');
  const modelRepo = mongoConn.getMongoRepository(MongoModelDetail);

  const existingModel = await modelRepo.findOne({ name, brandId });

  if (existingModel) {
    throw new BadRequestError('Model already Exist For this Brand', 'MODEL_ALREADY_EXIST');
  }

  const newModel = Object.assign({}, req.body || {});

  let model = modelRepo.create(newModel);
  model = await modelRepo.save(model);

  res.status(200).json(model);
};

export const deleteModelValidation = {
  params: Joi.object({ id: Joi.string().required() }),
};
export const deleteModel = () => async (req: Request, res: Response): Promise<void> => {
  const {
    params: { id },
  } = req;

  const mongoConn = getConnection('mongodb');
  const modelRepo = mongoConn.getMongoRepository(MongoModelDetail);

  const existingModel = await modelRepo.findOneOrFail({ where: { _id: new ObjectID(id) } });

  if (!existingModel) {
    throw new BadRequestError('Model not Available', 'Model_NOT_EXIST');
  }

  if (existingModel) {
    await modelRepo.delete(existingModel);
    res.status(200).json('Model is Deleted Successfully');
  } else {
    res.status(400).json('Something went wrong');
  }
};

export const getBrandOptionsByInventoryNameValidation = {
  query: Joi.object({
    inventoryName: Joi.string().required(),
    brandId: Joi.string().required(),
  }),
};
export const getBrandOptionsByInventoryName = () => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    query: { inventoryName, brandId },
  } = req;

  const mongoConn = getConnection('mongodb');
  const modelRepo = mongoConn.getMongoRepository(MongoModelDetail);
  const inventoryMasterRepo = mongoConn.getMongoRepository(MongoInventoryMaster);

  const filteredInventoryMasterData = (
    (await inventoryMasterRepo.find({ where: { inventoryName, brandId } })) || []
  ).filter((inventoryMastersData) => inventoryMastersData?.availableUnits > 0);

  const availableModelsId = map(uniqBy(filteredInventoryMasterData, 'modelId'), 'modelId');

  const modelOptions = await modelRepo.find({
    where: {
      _id: { $in: (availableModelsId || []).map((modelId) => new ObjectID(modelId || '')) },
    },
  });
  let UpdatedModelOptions: Array<Options> = [];

  if (modelOptions && modelOptions.length) {
    UpdatedModelOptions = (modelOptions || []).map((model) => ({
      value: model?._id.toString(),
      label: model?.name,
    }));
  }

  res.status(200).json({ modelOptions: UpdatedModelOptions });
};
