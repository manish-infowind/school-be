import { Router } from 'express';
import { submitCollegeApplication } from '../controllers/collegeApplicationController';

const router = Router();

router.post('/', submitCollegeApplication);

export default router;
