import { Router } from 'express';

import users from './users';
import auth from './auth';
import model from './model';
import brand from './brand';
import requests from './requests';
import dashboard from './dashboard';
import developers from './developers';
import notications from './notications';
import inventories from './inventories';
import purchaseEntry from './purchaseEntry';
import inventoryNames from './inventoryNames';
import assignInventory from './assignInventory';

const routes = Router();

routes.get('/', (req, res) => res.status(400).json({ message: 'Access not allowed' }));

routes.use('/auth', auth());
routes.use('/users', users());
routes.use('/brand', brand());
routes.use('/model', model());
routes.use('/request', requests());
routes.use('/dashboard', dashboard());
routes.use('/inventory', inventories());
routes.use('/developers', developers());
routes.use('/notification', notications());
routes.use('/purchaseEntry', purchaseEntry());
routes.use('/inventoryName', inventoryNames());
routes.use('/assignInventory', assignInventory());

export default (): Router => routes;
