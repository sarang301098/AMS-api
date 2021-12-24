import { Router } from 'express';
import { validate } from 'express-validation';
import { UserType, Media } from '../constants';

import { authenticate, singleFileS3, handleError, checkUserType } from '../middleware';
import {
  avatar,
  changePassword,
  changePasswordValidation,
  createUser,
  createUserValidation,
  getById,
  forgetPasswordValidation,
  forgetPassword,
  getUserValidation,
  profile,
  updateProfile,
  updateUserValidation,
  userProfileValidation,
  resetPassword,
  resetPasswordValidation,
  updatePasswordValidation,
  updatePassword,
  getAllUsersByAdminValidation,
  getAllUsersByAdmin,
  createUserByAdminValidation,
  createUserByAdmin,
} from '../controller/users';

const router = Router();

const postCreateUser = (): Router =>
  router.post('/', validate(createUserValidation, { context: true }), handleError(createUser()));

const patchAvatar = (): Router =>
  router.patch('/avatar', authenticate, singleFileS3(Media.USER, 'avatar'), handleError(avatar()));

const patchChangePassword = (): Router =>
  router.patch(
    '/change-password',
    authenticate,
    validate(changePasswordValidation),
    handleError(changePassword()),
  );

const getProfile = (): Router =>
  router.get(
    '/me',
    authenticate,
    validate(userProfileValidation, { context: true }),
    handleError(profile()),
  );

const getUser = (): Router =>
  router.get(
    '/:id',
    authenticate,
    validate(getUserValidation, { context: true }),
    handleError(getById()),
  );

const putUpdateProfile = (): Router =>
  router.put(
    '/:id',
    authenticate,
    validate(updateUserValidation, { context: true }),
    handleError(updateProfile()),
  );

const postForgetPassword = (): Router =>
  router.post(
    '/forget-password',
    validate(forgetPasswordValidation, { context: true }),
    handleError(forgetPassword()),
  );

const patchResetPassword = (): Router =>
  router.patch(
    '/:id/reset-password',
    authenticate,
    validate(resetPasswordValidation),
    handleError(resetPassword()),
  );

const postUpdatePassword = (): Router =>
  router.post(
    '/update-password',
    validate(updatePasswordValidation, { context: true }),
    handleError(updatePassword()),
  );

const getallUsersToAdmin = (): Router =>
  router.get(
    '/all/toAdmin',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(getAllUsersByAdminValidation, { context: true }),
    handleError(getAllUsersByAdmin()),
  );

const postUserByAdmin = (): Router =>
  router.post(
    '/byAdmin',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(createUserByAdminValidation, { context: true }),
    handleError(createUserByAdmin()),
  );

export default (): Router =>
  router.use([
    postCreateUser(),
    patchAvatar(),
    patchChangePassword(),
    postForgetPassword(),
    getProfile(),
    getUser(),
    putUpdateProfile(),
    patchResetPassword(),
    postUpdatePassword(),
    getallUsersToAdmin(),
    postUserByAdmin(),
  ]);
