import { Router } from 'express';
import { validate } from 'express-validation';

import { authenticate, handleError, checkUserType } from '../middleware';
import {
  getBrandOptionsValidation,
  getBrandOptions,
  createBrandValidation,
  createBrand,
  deleteBrandValidation,
  deleteBrand,
  getBrandOptionsByInventoryNameValidation,
  getBrandOptionsByInventoryName,
} from '../controller/brand';
import { UserType } from '../constants';

const router = Router();

const brandOptions = (): Router =>
  router.get(
    '/options',
    validate(getBrandOptionsValidation, { context: true }),
    handleError(getBrandOptions()),
  );

const postCreateBrand = (): Router =>
  router.post(
    '/',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(createBrandValidation, { context: true }),
    handleError(createBrand()),
  );

const deletebrandById = (): Router =>
  router.delete(
    '/:id',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(deleteBrandValidation, { context: true }),
    handleError(deleteBrand()),
  );

const getBrandOptionsByInventory = (): Router =>
  router.get(
    '/options/byInventory',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(getBrandOptionsByInventoryNameValidation, { context: true }),
    handleError(getBrandOptionsByInventoryName()),
  );

export default (): Router =>
  router.use([brandOptions(), postCreateBrand(), deletebrandById(), getBrandOptionsByInventory()]);
