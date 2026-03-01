import { Router } from 'express';
import { createEnquiry } from '../controllers/enquiryController';

const router = Router();

router.post('/', createEnquiry);

export default router;
