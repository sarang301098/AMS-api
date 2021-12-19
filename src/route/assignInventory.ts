import { Router } from 'express';
import { validate } from 'express-validation';

import { authenticate, handleError, checkUserType } from '../middleware';
import {
  getAssignInventoryByUserIdValidation,
  getAssignInventoryByUserId,
} from '../controller/assignDetails';
import { UserType } from '../constants';

const router = Router();

const getAssignmentDetails = (): Router =>
  router.get(
    '/',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(getAssignInventoryByUserIdValidation, { context: true }),
    handleError(getAssignInventoryByUserId()),
  );

export default (): Router => router.use([getAssignmentDetails()]);
