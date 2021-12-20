import { Between, getConnection } from 'typeorm';
import { Request, Response } from 'express';
import { Joi } from 'express-validation';

import { ObjectID } from 'mongodb';

import { Users as MongoUsers } from '../model/mongo/users';
import { BrandDetail as MongoBrandDetail } from '../model/mongo/BrandDetail';
import { ModelDetail as MongoModelDetail } from '../model/mongo/ModelDetail';
import { InventoryAssignedDetail as MongoInventoryAssignedDetail } from '../model/mongo/InventoryAssignedDetail';
import { InventoryMaster as MongoInventoryMaster } from '../model/mongo/InventoryMaster';
import { InventoryDetail as MongoInventoryDetail } from '../model/mongo/InventoryDetail';

export const getAssignInventoryByUserIdValidation = {
  query: Joi.object({
    startDate: Joi.string().default(new Date()),
    endDate: Joi.string().default(new Date()),
    page: Joi.number().integer().min(1),
    perPage: Joi.number().integer().min(1).max(40),
    isPaginate: Joi.boolean().default(false),
  }),
};
export const getAssignInventoryByUserId = () => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    query: { startDate, endDate, page, perPage, isPaginate },
  } = req;

  const mongoConn = getConnection('mongodb');
  const brandsRepo = mongoConn.getMongoRepository(MongoBrandDetail);
  const modelRepo = mongoConn.getMongoRepository(MongoModelDetail);
  const inventoryAssignedDetailRepo = mongoConn.getMongoRepository(MongoInventoryAssignedDetail);
  const inventoryMasterRepo = mongoConn.getMongoRepository(MongoInventoryMaster);
  const inventoryDetailRepo = mongoConn.getMongoRepository(MongoInventoryDetail);
  const usersRepo = mongoConn.getMongoRepository(MongoUsers);
  let assignmentData;
  let filterObject;

  const limit = Number(perPage);
  const offset = (Number(page) - 1) * limit;

  if (isPaginate && page && perPage) {
    filterObject = {
      take: limit,
      skip: offset,
    };
  }

  const [
    assignmentDetails,
    assignmentDetailsCount,
  ] = await inventoryAssignedDetailRepo.findAndCount({
    where: {
      createdAt: Between(new Date(startDate), new Date(endDate)),
      // createdAt: {
      //   $gte: new Date(),
      //   $lte: new Date(),
      // },
    },
    ...filterObject,
  });

  if (assignmentDetails && assignmentDetailsCount) {
    assignmentData = await Promise.all(
      (assignmentDetails || []).map(async (assignmentDetailsData: MongoInventoryAssignedDetail) => {
        let inventoryMastersData;
        const inventoryDetailsData = await inventoryDetailRepo.findOne(
          assignmentDetailsData?.inventoryDetailId || '',
        );

        if (inventoryDetailsData && inventoryDetailsData.inventoryId) {
          inventoryMastersData = await inventoryMasterRepo.findOne(
            inventoryDetailsData.inventoryId || '',
          );
        }

        return {
          ...assignmentDetailsData,
          userData: await usersRepo.findOneOrFail({
            where: { _id: new ObjectID(assignmentDetailsData?.assignedUserId || '') },
            select: ['username', 'general'],
          }),
          isAssigne: inventoryDetailsData?.isAssigne,
          label: inventoryDetailsData?.label,
          brandData: await brandsRepo.findOneOrFail({
            where: { _id: new ObjectID(inventoryMastersData?.brandId || '') },
            select: ['name'],
          }),
          modelData: await modelRepo.findOneOrFail({
            where: { _id: new ObjectID(inventoryMastersData?.modelId || '') },
            select: ['name'],
          }),
        };
      }),
    );
  }

  res.status(200).json({ assignmentData, assignmentDetails, assignmentDetailsCount });
};
