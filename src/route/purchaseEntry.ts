import { Router } from 'express';
import { validate } from 'express-validation';
import { UserType } from '../constants';

import { authenticate, handleError, checkUserType } from '../middleware';
import {
  createpurchaseEntry,
  createPurchaseEntryValidation,
  getPurchaseAllValidation,
  getPurchaseAll,
} from '../controller/purchaseEntry';

const router = Router();

const postPuchaseEntry = (): Router =>
  router.post(
    '/',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(createPurchaseEntryValidation, { context: true }),
    handleError(createpurchaseEntry()),
  );

const getPuchaseEntry = (): Router =>
  router.get(
    '/',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(getPurchaseAllValidation, { context: true }),
    handleError(getPurchaseAll()),
  );

export default (): Router => router.use([postPuchaseEntry(), getPuchaseEntry()]);
