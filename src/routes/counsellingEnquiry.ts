import { Router } from 'express';
import { submitCounsellingEnquiry } from '../controllers/counsellingEnquiryController';

const router = Router();

router.post('/', submitCounsellingEnquiry);

export default router;
