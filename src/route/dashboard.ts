import { Router } from 'express';
import { validate } from 'express-validation';
import { UserType } from '../constants';

import { authenticate, handleError, checkUserType } from '../middleware';
import {
  getAdminDashboardValidation,
  getAdminDashboard,
  getUserDashboardValidation,
  getUserDashboard,
} from '../controller/dashboard';

const router = Router();

const getAdminDashboardData = (): Router =>
  router.get(
    '/admin',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(getAdminDashboardValidation, { context: true }),
    handleError(getAdminDashboard()),
  );

const getUserDashboardData = (): Router =>
  router.get(
    '/user/:userId',
    authenticate,
    checkUserType(UserType.USER),
    validate(getUserDashboardValidation, { context: true }),
    handleError(getUserDashboard()),
  );

export default (): Router => router.use([getAdminDashboardData(), getUserDashboardData()]);
