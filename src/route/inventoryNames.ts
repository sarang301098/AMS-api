import { Router } from 'express';
import { validate } from 'express-validation';

import { authenticate, handleError, checkUserType } from '../middleware';
import {
  getInventoryNameOptionsValidation,
  getInventoryNameOptions,
  createInventoryNameValidation,
  createInventoryName,
  deleteInventoryNameValidation,
  deleteInventoryName,
} from '../controller/inventoryNames';
import { UserType } from '../constants';

const router = Router();

const inventoryNameOptions = (): Router =>
  router.get(
    '/options',
    authenticate,
    validate(getInventoryNameOptionsValidation, { context: true }),
    handleError(getInventoryNameOptions()),
  );

const postCreateInventoryName = (): Router =>
  router.post(
    '/',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(createInventoryNameValidation, { context: true }),
    handleError(createInventoryName()),
  );

const deleteInventoryNameById = (): Router =>
  router.delete(
    '/:id',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(deleteInventoryNameValidation, { context: true }),
    handleError(deleteInventoryName()),
  );

export default (): Router =>
  router.use([inventoryNameOptions(), postCreateInventoryName(), deleteInventoryNameById()]);
