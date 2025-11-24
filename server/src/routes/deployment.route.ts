import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';

import {
  createDeployment,
  getDeployments,
  getDeploymentById,
  updateDeployment,
  deleteDeployment
} from '../controllers/deployment.controller';



const router = Router();

router.use(authMiddleware);

router.post('/', createDeployment);
router.get('/', getDeployments);
router.get('/:id', getDeploymentById);
router.patch('/:id', updateDeployment);
router.delete('/:id', deleteDeployment);

export default router;