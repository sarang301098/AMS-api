import { FindConditions, getConnection } from 'typeorm';
import { Request, Response } from 'express';
import { Joi } from 'express-validation';
import { AvailableInventory } from '../model/mongo/InventoryMaster';
import { AvailableInventoryRepository } from '../repository/AvailableInventory';

export const getTotalAvailableInventoryValidation = {
  query: Joi.object({
    q: Joi.string(),
  }),
};
export const getTotalAvailableInventory = () => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    query: { q },
  } = req;
  let where: FindConditions<AvailableInventory> = {};
  if (q) {
    where = { ...where, inventoryName: `${q}` };
  }
  const mongoConn = getConnection('mongodb');
  const availableInventoryRepo = mongoConn.getCustomRepository(AvailableInventoryRepository);
  const availableInventory = await availableInventoryRepo.find({
    where,
  });
  res.status(200).json(availableInventory);
};
