import { getConnection } from 'typeorm';
import { Request, Response } from 'express';
import { Joi } from 'express-validation';
import moment from 'moment';
import { sumBy } from 'lodash';

import { generateRandomHex } from '../service/random';

import { BadRequestError, ForbiddenError } from '../error';
import { Developer as MongoDevelopers } from '../model/mongo/developers';
import { DeveloperStatistics as MongoDevelopersStatistics } from '../model/mongo/developerStatistics';

const namePattern = '^[A-za-z]';
export const getDevelopersValidation = {
  body: Joi.object({
    queryParams: Joi.object({
      filter: Joi.object({
        name: Joi.string().max(255).allow(''),
        email: Joi.string().max(255).allow(''),
        fullname: Joi.string().max(255).allow(''),
        deviceId: Joi.string().max(255).allow(''),
      }),
      pageNumber: Joi.number(),
      pageSize: Joi.number(),
      sortField: Joi.string().max(255).allow(''),
      sortOrder: Joi.string().max(255).allow(''),
    }),
  }),
};
export const getAll = () => async (req: Request, res: Response): Promise<void> => {
  // const { queryParams } = req.body || {};

  // Get Connection to mongoDb
  // const mongoConn = getConnection('mongodb');
  // const developerRepo = mongoConn.getMongoRepository(MongoDevelopers);

  // const [developers] = await developerRepo.findAndCount({});

  // Manage Filters Services
  // const service = new DevelopersFilter();
  // const result = await service.execute(developers, queryParams);

  res.status(200).json();
};

// Create New Developer with User Type
export const createDevelopersValidation = {
  body: Joi.object({
    fullname: Joi.string().max(255).regex(new RegExp(namePattern)).required(),
    email: Joi.string().max(255).email().required(), // email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    gender: Joi.string().required(),
    address: Joi.string(),
    technology: Joi.string().max(255).required(),
    technologies: Joi.array(),
    deviceId: Joi.string().max(255).required(),
    status: Joi.number().max(5).required(),
    deviceType: Joi.string().max(255).required(),
    pcId: Joi.string().max(255).required(),
  }),
};
export const createDeveloper = () => async (req: Request, res: Response): Promise<void> => {
  const {
    body: { email },
  } = req;

  const mongoConn = getConnection('mongodb');
  const DevelopersRepo = mongoConn.getMongoRepository(MongoDevelopers);

  const existingDeveloper = await DevelopersRepo.findOne({ email });

  if (existingDeveloper) {
    throw new BadRequestError('Email address already used', 'EMAIL_ALREADY_EXIST');
  }

  const newDeveloper = Object.assign({}, req.body || {}, { id: generateRandomHex(10) });

  let developer = DevelopersRepo.create(newDeveloper);
  developer = await DevelopersRepo.save(developer);

  const { ...developerInfo } = developer;

  res.status(201).json(developerInfo);
};

// Get the Developer by the Id
export const getDeveloperValidation = {
  params: Joi.object({
    id: Joi.string().uuid({ version: 'uuidv4' }).required(),
  }),
};
export const getDeveloperById = () => async (req: Request, res: Response): Promise<void> => {
  const {
    params: { id },
  } = req;

  const mongoConn = getConnection('mongodb');
  const DevelopersRepo = mongoConn.getMongoRepository(MongoDevelopers);

  const developer = await DevelopersRepo.findOne({ id });

  res.status(200).json(developer);
};

// Update Developer By Id
export const updateDeveloperValidation = {
  body: Joi.object({
    id: Joi.string().max(255),
    fullname: Joi.string().max(255).regex(new RegExp(namePattern)),
    email: Joi.string().max(255).lowercase().email(),
    gender: Joi.string().max(15).default('none'),
    technology: Joi.string().default('none'),
    technologies: Joi.array().default([]),
    deviceId: Joi.string(),
    deviceType: Joi.string().default('none'),
    pcId: Joi.string(),
    pic: Joi.string(),
    address: Joi.string().max(255),
    phone: Joi.string().max(255),
    status: Joi.number().max(3),
  }),
};
export const updateDeveloper = () => async (req: Request, res: Response): Promise<void> => {
  const {
    body: { ...updatedDeveloper },
    params: { id },
  } = req;

  if (updatedDeveloper && updatedDeveloper.technology === 'none') {
    updatedDeveloper.technologies = [];
  }

  const mongoConn = getConnection('mongodb');
  const developersRepo = mongoConn.getMongoRepository(MongoDevelopers);

  let developerToUpdate = await developersRepo.findOneOrFail({ id });
  if (!developerToUpdate) {
    throw new ForbiddenError(`Developer Not Found By Given Id`);
  }

  developerToUpdate = Object.assign({}, developerToUpdate, updatedDeveloper || {});
  await developersRepo.findOneAndUpdate({ id }, { $set: developerToUpdate });

  res.json(developerToUpdate);
};

// Delete single Developer By Id
export const deletedeleteDeveloperValidation = {
  params: Joi.object({ id: Joi.string().required() }),
};
export const deleteDeveloper = () => async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const mongoConn = getConnection('mongodb');
  const developersRepo = mongoConn.getMongoRepository(MongoDevelopers);
  const developersStatisticsRepo = mongoConn.getMongoRepository(MongoDevelopersStatistics);

  await developersRepo.deleteOne({ id });
  await developersStatisticsRepo.deleteMany({
    where: {
      developerId: id,
    },
  });

  res.sendStatus(204);
};

// Delete All Developers By Id array
export const deletedeleteDevelopersValidation = {
  body: Joi.object({ ids: Joi.array() }),
};
export const deleteDevelopers = () => async (req: Request, res: Response): Promise<void> => {
  const { ids } = req.body;

  const mongoConn = getConnection('mongodb');
  const developersRepo = mongoConn.getMongoRepository(MongoDevelopers);
  const developersStatisticsRepo = mongoConn.getMongoRepository(MongoDevelopersStatistics);

  await developersRepo.deleteMany({ id: { $in: ids } });
  await developersStatisticsRepo.deleteMany({
    where: {
      developerId: { $in: ids },
    },
  });

  res.sendStatus(204);
};

// Update All Developers's By Id array and status
export const updateStatusDevelopersValidation = {
  body: Joi.object({
    ids: Joi.array(),
    status: Joi.number(),
  }),
};
export const updateStatusDevelopers = () => async (req: Request, res: Response): Promise<void> => {
  const { ids, status } = req.body;

  const mongoConn = getConnection('mongodb');
  const developersRepo = mongoConn.getMongoRepository(MongoDevelopers);

  await developersRepo.updateMany({ id: { $in: ids } }, { $set: { status } });

  res.sendStatus(204);
};

// Update All Developers's By Id array and status
export const updateStatusDevelopersStatisticsValidation = {
  params: Joi.object({ id: Joi.string().required() }),
};
export const updateDevelopersStatistics = () => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params || {};

  const mongoConn = getConnection('mongodb');
  const developersRepo = mongoConn.getMongoRepository(MongoDevelopersStatistics);

  const date = new Date();
  const currentDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
  );

  const statsInc = { visits: 1 };
  await developersRepo.updateOne(
    { developerId: id, date: currentDate },
    { $inc: statsInc },
    { upsert: true },
  );

  res.sendStatus(204);
};

// Get Developers-Statistics Based on the ids
export const getDeveloperStatisticsValidation = {
  body: Joi.object({
    queryParams: Joi.object({
      startDate: Joi.date(),
      endDate: Joi.date(),
      todayStart: Joi.date(),
      ids: Joi.array().default([]),
    }),
  }),
};
export const getDeveloperStatistics = () => async (req: Request, res: Response): Promise<void> => {
  const { queryParams } = req.body || {};

  const mongoConn = getConnection('mongodb');
  const developersRepo = mongoConn.getMongoRepository(MongoDevelopers);
  const developersStatisticsRepo = mongoConn.getMongoRepository(MongoDevelopersStatistics);

  const [developers] = await developersRepo.findAndCount({});
  const developerIds =
    queryParams.ids && queryParams.ids.length
      ? queryParams.ids
      : (developers || []).map((p) => p.id);

  const developerStatisticsData = {
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    developerStatistics: await developersStatisticsRepo.find({
      where: {
        developerId: { $in: developerIds },
        date: {
          $gte: moment(queryParams.startDate).toDate(),
          $lte: moment(queryParams.endDate).toDate(),
        },
      },
    }),

    visitsToday:
      sumBy(
        await developersStatisticsRepo.find({
          where: {
            developerId: { $in: developerIds || [] },
            date: { $gte: moment(queryParams.todayStart).toDate() },
          },
        }),
        'visits',
      ) || 0,

    visitsYesterday:
      sumBy(
        await developersStatisticsRepo.find({
          where: {
            developerId: { $in: developerIds || [] },
            date: {
              $gte: moment(queryParams.todayStart).subtract(1, 'days').toDate(),
              $lt: moment(queryParams.todayStart).toDate(),
            },
          },
        }),
        'visits',
      ) || 0,

    visits7Days:
      sumBy(
        await developersStatisticsRepo.find({
          where: {
            developerId: { $in: developerIds || [] },
            date: {
              $gte: moment().subtract(7, 'days').startOf('day').toDate(),
            },
          },
        }),
        'visits',
      ) || 0,

    visits30Days:
      sumBy(
        await developersStatisticsRepo.find({
          where: {
            developerId: { $in: developerIds || [] },
            date: { $gte: moment(queryParams.startDate).toDate() },
          },
        }),
        'visits',
      ) || 0,
  };

  res.status(200).json(developerStatisticsData);
};

export const getDeveloperMultiSelectOptions = () => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const mongoConn = getConnection('mongodb');
  const developersRepo = mongoConn.getMongoRepository(MongoDevelopers);

  const [developers, count] = await developersRepo.findAndCount({});

  const develpersOptions = (developers || []).map((developer) => ({
    label: developer.fullname,
    value: developer.id,
  }));

  res.status(200).json({ develpersOptions, count });
};
