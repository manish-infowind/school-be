import { Router } from 'express';
import { listUpcomingAndRunningEvents, getEventDetails } from '../controllers/eventController';

const router = Router();

router.get('/', listUpcomingAndRunningEvents);
router.get('/:id', getEventDetails);

export default router;
