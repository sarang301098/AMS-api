/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from 'express';
import { validate } from 'express-validation';
import { UserType } from '../constants';
import { authenticate, handleError, checkUserType } from '../middleware';
import {
  DeleteInventory,
  DeleteInventoryValidation,
  getAvailableInventory,
} from '../controller/inventoryList';

const router = Router();

const deleteInventoryList = (): Router =>
  router.delete(
    '/:inventoryId',
    authenticate,
    checkUserType(UserType.ADMIN),
    // validate(DeleteInventoryValidation, { context: true }),
    handleError(DeleteInventory()),
  );

const availableInventoryList = (): Router =>
  router.get(
    '/list-inventory',
    authenticate,
    checkUserType(UserType.ADMIN),
    handleError(getAvailableInventory()),
  );

export default (): Router => router.use([deleteInventoryList(), availableInventoryList()]);
