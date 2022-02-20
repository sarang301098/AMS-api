import { Router } from 'express';
import { validate } from 'express-validation';
import { UserType } from '../constants';

import { authenticate, handleError, checkUserType } from '../middleware';
import {
  createRequest,
  createRequestValidation,
  getAll,
  getRequestValidation,
  getRequestByRequestId,
  getRequestByRequestIdValidation,
  getUserAll,
  getAdminRequestList,
  getAdminRequestListValidation,
  deleteRequest,
  updateRequestValidation,
  updateRequest,
  AdminUpdateRequestValidation,
  AdminUpdateRequest,
  deleteRequestValidation,
  getUserRequestValidation,
} from '../controller/requests';

const router = Router();

const postCreateRequest = (): Router =>
  router.post(
    '/create/',
    authenticate,
    checkUserType(UserType.USER),
    validate(createRequestValidation, { context: true }),
    handleError(createRequest()),
  );

const getAllRequest = (): Router =>
  router.get(
    '/admin/all/',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(getRequestValidation, { context: true }),
    handleError(getAll()),
  );

const getAllUserRequest = (): Router =>
  router.get(
    '/all/user/',
    authenticate,
    checkUserType(UserType.USER),
    validate(getUserRequestValidation, { context: true }),
    handleError(getUserAll()),
  );

const getRequest = (): Router =>
  router.get(
    '/:id/',
    authenticate,
    validate(getRequestByRequestIdValidation, { context: true }),
    handleError(getRequestByRequestId()),
  );

const adminRequestList = (): Router =>
  router.get(
    '/all/admin',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(getAdminRequestListValidation, { context: true }),
    handleError(getAdminRequestList()),
  );

const deleteRequestById = (): Router =>
  router.delete(
    '/:id',
    authenticate,
    checkUserType(UserType.USER),
    validate(deleteRequestValidation, { context: true }),
    handleError(deleteRequest()),
  );

const UserUpdateRequest = (): Router =>
  router.put(
    '/:id',
    authenticate,
    checkUserType(UserType.USER),
    validate(updateRequestValidation, { context: true }),
    handleError(updateRequest()),
  );

const AdminUpdateRequestByRequestId = (): Router =>
  router.put(
    '/admin/:id',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(AdminUpdateRequestValidation, { context: true }),
    handleError(AdminUpdateRequest()),
  );

export default (): Router =>
  router.use([
    postCreateRequest(),
    getAllRequest(),
    getAllUserRequest(),
    getRequest(),
    adminRequestList(),
    deleteRequestById(),
    UserUpdateRequest(),
    AdminUpdateRequestByRequestId(),
  ]);
