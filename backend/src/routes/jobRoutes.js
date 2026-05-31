import { Router } from 'express';
import { JobController } from '../controllers/jobController.js';

const router = Router();

// Routes definitions
router.get('/', JobController.getAllJobs);
router.post('/manual', JobController.createManualJob);
router.get('/:guid', JobController.getJobDetails);

export default router;
