import { Router } from 'express';
import { getCountries, getStates, getCities, getCourses } from '../controllers/locationController';

const router = Router();

router.get('/countries', getCountries);
router.get('/states', getStates);
router.get('/cities', getCities);
router.get('/courses', getCourses);

export default router;
