import { Router } from 'express';
import { listPopularStreams, listStreams } from '../controllers/streamController';

const router = Router();

router.get('/popular', listPopularStreams);
router.get('/', listStreams);

export default router;
