import { Router } from 'express';
import { validate } from 'express-validation';
import { UserType } from '../constants';

import { authenticate, handleError, checkUserType } from '../middleware';
import {
  getDevelopersValidation,
  getAll,
  createDevelopersValidation,
  createDeveloper,
  getDeveloperById,
  updateDeveloperValidation,
  updateDeveloper,
  deletedeleteDeveloperValidation,
  deleteDeveloper,
  deletedeleteDevelopersValidation,
  deleteDevelopers,
  updateStatusDevelopersValidation,
  updateStatusDevelopers,
  updateStatusDevelopersStatisticsValidation,
  updateDevelopersStatistics,
  getDeveloperStatisticsValidation,
  getDeveloperStatistics,
  getDeveloperMultiSelectOptions,
} from '../controller/developers';

const router = Router();

const getDevelopers = (): Router =>
  router.post(
    '/',
    authenticate,
    validate(getDevelopersValidation, { context: true }),
    handleError(getAll()),
  );

const postCreateDeveloper = (): Router =>
  router.post(
    '/create',
    validate(createDevelopersValidation, { context: true }),
    handleError(createDeveloper()),
  );

const getDeveloper = (): Router =>
  router.get(
    '/:id',
    authenticate,
    validate(getDevelopersValidation, { context: true }),
    handleError(getDeveloperById()),
  );

const putUpdateDeveloper = (): Router =>
  router.put(
    '/:id',
    authenticate,
    validate(updateDeveloperValidation, { context: true }),
    handleError(updateDeveloper()),
  );

const deleteById = (): Router =>
  router.delete(
    '/:id',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(deletedeleteDeveloperValidation),
    handleError(deleteDeveloper()),
  );

const deleteByIds = (): Router =>
  router.post(
    '/deleteByIds',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(deletedeleteDevelopersValidation),
    handleError(deleteDevelopers()),
  );

const updateStatusByIds = (): Router =>
  router.post(
    '/updateStatus',
    authenticate,
    checkUserType(UserType.SUPER_ADMIN),
    validate(updateStatusDevelopersValidation),
    handleError(updateStatusDevelopers()),
  );

const updateStatistics = (): Router =>
  router.put(
    '/statistics/:id',
    validate(updateStatusDevelopersStatisticsValidation),
    handleError(updateDevelopersStatistics()),
  );

const getStatistics = (): Router =>
  router.post(
    '/statistics/develoers',
    validate(getDeveloperStatisticsValidation),
    handleError(getDeveloperStatistics()),
  );

const getDeveloperSelectOptions = (): Router =>
  router.get('/statistics/develoers/options', handleError(getDeveloperMultiSelectOptions()));

export default (): Router =>
  router.use([
    getDevelopers(),
    postCreateDeveloper(),
    getDeveloper(),
    putUpdateDeveloper(),
    deleteById(),
    deleteByIds(),
    updateStatusByIds(),
    updateStatistics(),
    getStatistics(),
    getDeveloperSelectOptions(),
  ]);
