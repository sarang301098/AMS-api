import { Router } from 'express';

import users from './users';
import developers from './developers';
import auth from './auth';
import assignInventory from './assignInventory';
import brand from './brand';
import dashboard from './dashboard';
import model from './model';
import requests from './requests';
import inventoryNames from './inventoryNames';
import notications from './notications';
import purchaseEntry from './purchaseEntry';
import inventories from './inventories';

const routes = Router();

routes.get('/', (req, res) => res.status(400).json({ message: 'Access not allowed' }));

routes.use('/developers', developers());
routes.use('/users', users());
routes.use('/dashboard', dashboard());
routes.use('/auth', auth());
routes.use('/brand', brand());
routes.use('/assignInventory', assignInventory());
routes.use('/model', model());
routes.use('/request', requests());
routes.use('/inventoryName', inventoryNames());
routes.use('/notification', notications());
routes.use('/purchaseEntry', purchaseEntry());
routes.use('/inventory', inventories());

export default (): Router => routes;
