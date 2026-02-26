import { Router } from 'express';
import { createEnquiry, getEnquiries, updateEnquiryStatus } from '../controllers/enquiryController';

const router = Router();

/**
 * @openapi
 * /api/enquiries:
 *   get:
 *     summary: Get all enquiries
 *     tags: [Enquiries]
 *     responses:
 *       200:
 *         description: List of enquiries
 */
router.get('/', getEnquiries);

/**
 * @openapi
 * /api/enquiries:
 *   post:
 *     summary: Create a new enquiry
 *     tags: [Enquiries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentName:
 *                 type: string
 *               studentEmail:
 *                 type: string
 *               phone:
 *                 type: string
 *               message:
 *                 type: string
 *               collegeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Enquiry created
 */
router.post('/', createEnquiry);

/**
 * @openapi
 * /api/enquiries/{id}/status:
 *   patch:
 *     summary: Update enquiry status
 *     tags: [Enquiries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, resolved]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', updateEnquiryStatus);

export default router;
