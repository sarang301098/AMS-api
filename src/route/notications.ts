import { Router } from 'express';
import { validate } from 'express-validation';
import { UserType } from '../constants';

import { authenticate, handleError, checkUserType } from '../middleware';
import {
  getNotificationByAdmin,
  getNotificationByNotificationId,
  getNotificationByUserId,
  getNotificationByUserIdValidation,
  getNotificationByIdValidation,
  deleteNotificationsValidation,
  deleteNotifications,
  deleteNotificationValidation,
  deleteNotificationById,
  updateVisitedNotificationValidation,
  updateVisitedNotification,
  getNotificationByAdminValidation,
} from '../controller/notifications';

const router = Router();
const getNotificationByUsers = (): Router =>
  router.get(
    '/:id',
    authenticate,
    checkUserType(UserType.USER),
    validate(getNotificationByUserIdValidation, { context: true }),
    handleError(getNotificationByUserId()),
  );
const getNotificationById = (): Router =>
  router.get(
    '/byId/:notificationId',
    authenticate,
    validate(getNotificationByIdValidation, { context: true }),
    handleError(getNotificationByNotificationId()),
  );
const deleteByIds = (): Router =>
  router.post(
    '/deleteByIds',
    authenticate,
    validate(deleteNotificationsValidation),
    handleError(deleteNotifications()),
  );
const getNotificationByAdminList = (): Router =>
  router.get(
    '/admin/all',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(getNotificationByAdminValidation, { context: true }),
    handleError(getNotificationByAdmin()),
  );

const deleteById = (): Router =>
  router.delete(
    '/:id',
    authenticate,
    validate(deleteNotificationValidation, { context: true }),
    handleError(deleteNotificationById()),
  );
const updateNotificationStatusByIds = (): Router =>
  router.post(
    '/updateStatus',
    authenticate,
    validate(updateVisitedNotificationValidation),
    handleError(updateVisitedNotification()),
  );

export default (): Router =>
  router.use([
    getNotificationByUsers(),
    getNotificationByAdminList(),
    updateNotificationStatusByIds(),
    getNotificationById(),
    deleteByIds(),
    deleteById(),
  ]);
