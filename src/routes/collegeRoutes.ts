import { Router } from 'express';
import { listColleges, getCollegeBySlug } from '../controllers/collegeController';

const router = Router();

router.get('/', listColleges);
router.get('/:slug', getCollegeBySlug);

export default router;
