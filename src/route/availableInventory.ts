/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from 'express';
import { validate } from 'express-validation';
import { UserType } from '../constants';

import { authenticate, handleError, checkUserType } from '../middleware';
import {
  getTotalAvailableInventory,
  getTotalAvailableInventoryValidation,
} from '../controller/availableInventories';

const router = Router();

const getAvailableInventoryByInventoryName = (): Router =>
  router.get(
    '/',
    authenticate,
    checkUserType(UserType.ADMIN),
    validate(getTotalAvailableInventoryValidation, { context: true }),
    handleError(getTotalAvailableInventory()),
  );

export default (): Router => router.use([getAvailableInventoryByInventoryName()]);
