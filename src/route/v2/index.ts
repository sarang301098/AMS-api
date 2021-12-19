import { Router } from 'express';

const routes = Router();

routes.get('/', (req, res) => res.status(400).json({ message: 'Access not allowed' }));
export default (): Router => routes;
