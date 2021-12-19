import { Router } from 'express';
import { validate } from 'express-validation';

import { authenticate, handleError, checkUserType } from '../middleware';
import {
  getModelOptionsValidation,
  getModelOptions,
  createModelValidation,
  createModel,
  deleteModelValidation,
  deleteModel,
  getBrandOptionsByInventoryNameValidation,
  getBrandOptionsByInventoryName,
} from '../controller/model';
import { UserType } from '../constants';

const router = Router();

const modelOptions = (): Router =>
  router.get(
    '/options',
    validate(getModelOptionsValidation, { context: true }),
    handleError(getModelOptions()),
  );

const postCreateModel = (): Router =>
  router.post('/', validate(createModelValidation, { context: true }), handleError(createModel()));

const deleteModelById = (): Router =>
  router.delete(
    '/:id',
    validate(deleteModelValidation, { context: true }),
    handleError(deleteModel()),
  );

const getModelOptionsByInventory = (): Router =>
  router.get(
    '/options/byInventory',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(getBrandOptionsByInventoryNameValidation, { context: true }),
    handleError(getBrandOptionsByInventoryName()),
  );

export default (): Router =>
  router.use([modelOptions(), postCreateModel(), deleteModelById(), getModelOptionsByInventory()]);
