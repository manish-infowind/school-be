import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { login, refresh } from '../../controllers/adminAuthController';
import {
    adminListColleges,
    createCollege,
    getCollegeById,
    updateCollege,
    updateCollegeStatus,
    deleteCollege,
} from '../../controllers/collegeController';
import { listStates, createState, updateState } from '../../controllers/adminStateController';
import { listCities, createCity, updateCity } from '../../controllers/adminCityController';
import {
    listCourses,
    createCourse,
    getCourseById,
    updateCourse,
    deleteCourse,
} from '../../controllers/adminCourseController';
import { listEnquiries, getEnquiryById, updateEnquiry } from '../../controllers/adminEnquiryController';
import {
    listEvents,
    createEvent,
    getEventById,
    updateEvent,
    deleteEvent,
} from '../../controllers/adminEventController';
import { getDashboardCounts } from '../../controllers/adminDashboardController';
import { uploadCollegeImage } from '../../controllers/adminUploadController';

const router = Router();

// Auth (no JWT)
router.post('/auth/login', login);
router.post('/auth/refresh', refresh);

// Protected from here
router.use(authenticate);

router.post('/upload', uploadCollegeImage);
router.get('/dashboard', getDashboardCounts);

router.get('/colleges', adminListColleges);
router.post('/colleges', createCollege);
router.get('/colleges/:id', getCollegeById);
router.put('/colleges/:id', updateCollege);
router.patch('/colleges/:id/status', updateCollegeStatus);
router.delete('/colleges/:id', deleteCollege);

router.get('/states', listStates);
router.post('/states', createState);
router.put('/states/:id', updateState);

router.get('/cities', listCities);
router.post('/cities', createCity);
router.put('/cities/:id', updateCity);

router.get('/courses', listCourses);
router.post('/courses', createCourse);
router.get('/courses/:id', getCourseById);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

router.get('/enquiries', listEnquiries);
router.get('/enquiries/:id', getEnquiryById);
router.put('/enquiries/:id', updateEnquiry);

router.get('/events', listEvents);
router.post('/events', createEvent);
router.get('/events/:id', getEventById);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

export default router;
