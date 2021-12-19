/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  getCustomRepository,
  getConnection,
  FindConditions,
  getRepository,
  getMongoManager,
  getMongoRepository,
} from 'typeorm';
import { Request, Response } from 'express';
import { Joi } from 'express-validation';
import { InventoryListRepository } from '../repository/InventoryList';
import { Inventories } from '../model/mongo/InventoryAssignedDetail';
import { AvailableInventoryRepository } from '../repository/AvailableInventory';
import { MongoUsersRepository } from '../repository/Mongousers';
import { UserType } from '../constants';
import { InventoryList } from '../model/mongo/InventoryDetail';
import { MongoInventoriesRepository } from '../repository/Inventories';
import { PurchaseEntry } from '../model/mongo/PurchaseEntry';
import { result } from 'lodash';

export const DeleteInventoryValidation = {
  params: Joi.object({ inventoryId: Joi.string().required() }),
};
export const DeleteInventory = () => async (req: Request, res: Response): Promise<void> => {
  const { inventoryId } = req.params;
  const id = inventoryId;
  const mongoConn = getConnection('mongodb');
  const inventoryListRepo = mongoConn.getCustomRepository(InventoryListRepository);
  const inventoryRepo = mongoConn.getMongoRepository(Inventories);
  const availableInventoryRepo = mongoConn.getCustomRepository(AvailableInventoryRepository);
  const usersRepo = mongoConn.getCustomRepository(MongoUsersRepository);
  const inventoryList = await inventoryListRepo.findOne(id);
  const user = await usersRepo.find();
  const availableInventory = await availableInventoryRepo.findOne({
    where: { inventoryName: inventoryList?.inventoryName },
  });
  const [inventories, inventoriesCount] = await inventoryRepo.findAndCount({
    where: { inventoryListId: inventoryId },
  });
  // delete inventory list
  if (inventoryList) {
    await inventoryListRepo.delete(inventoryList);
  }
  // delete inventory entry

  if (inventories) {
    await inventoryRepo.deleteMany({ inventoryListId: inventoryId });
  }
  // Update usersAssigned enventory
  let i = 0;
  while (i < user.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let assignedInventory: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user.map(async (users: any) => {
      if (
        users.type === UserType.DEVELOPER &&
        users.assignedInventory &&
        users.assignedInventory.length > 0
      )
        assignedInventory = users.assignedInventory.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (value: any) => value.inventoryId !== inventoryId,
        );
      users.assignedInventory = assignedInventory;
      await usersRepo.save(users);
    });
    i++;
  }
  // Update available enventory
  if (availableInventory && availableInventory.inventoryName === inventoryList?.inventoryName) {
    const [inventoryList, inventoryListCount] = await inventoryListRepo.findAndCount({
      where: { isAssigned: false, inventoryName: availableInventory.inventoryName },
    });
    const [totalInventoryList, totalInventoryCount] = await inventoryListRepo.findAndCount({
      where: { inventoryName: availableInventory.inventoryName },
    });
    availableInventory.totalUnits = totalInventoryCount;
    availableInventory.availableUnits = inventoryListCount;
    availableInventory.assignedUnits =
      availableInventory.totalUnits - availableInventory.availableUnits;
    await availableInventoryRepo.save(availableInventory);
  }
  res.status(200).json('inventory deleted successfully');
};
// get available inventory list
export const getAvailableInventory = () => async (req: Request, res: Response): Promise<void> => {
  let where: FindConditions<InventoryList> = {};
  where = { isAssigned: false };
  const mongoConn = getConnection('mongodb');
  const inventoryListRepo = mongoConn.getCustomRepository(InventoryListRepository);
  const inventoryList = await inventoryListRepo.find({
    where,
  });
  const mongoManger = getMongoManager('mongodb');
  const objectLiterals = [
    {
      $group: {
        inventoryListId: '618e0827b53bd8d164db48cd',
        count: {
          $sum: 1,
        },
      },
    },
  ];

  res.status(200).json({ inventoryList });
};
