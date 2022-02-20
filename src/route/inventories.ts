import { Router } from 'express';
import { validate } from 'express-validation';
import { UserType } from '../constants';

import { authenticate, handleError, checkUserType } from '../middleware';
import {
  getInventoryByInventoryId,
  getInventoryByInventoryIdValidation,
  getInventoryByUserId,
  getInventoryByUserIdValidation,
  getAvailableInventoryDetailValidation,
  getAvailableInventoryDetailsData,
  AssignInventoryNewValidation,
  AssignInventoryNew,
} from '../controller/inventories';

const router = Router();

const getInventoriesById = (): Router =>
  router.get(
    '/:userId',
    validate(getInventoryByUserIdValidation, { context: true }),
    handleError(getInventoryByUserId()),
  );

const getInventoriesByInventoryListId = (): Router =>
  router.get(
    '/list/:inventoryListId',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(getInventoryByInventoryIdValidation, { context: true }),
    handleError(getInventoryByInventoryId()),
  );

const getAvailableInventoryDetail = (): Router =>
  router.get(
    '/check/inventoryDetail',
    authenticate,
    validate(getAvailableInventoryDetailValidation, { context: true }),
    handleError(getAvailableInventoryDetailsData()),
  );

const assignNew = (): Router =>
  router.post(
    '/assign/new',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(AssignInventoryNewValidation, { context: true }),
    handleError(AssignInventoryNew()),
  );

export default (): Router =>
  router.use([
    getInventoriesById(),
    getInventoriesByInventoryListId(),
    getAvailableInventoryDetail(),
    assignNew(),
  ]);
