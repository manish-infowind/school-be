import { Router } from 'express';
import { createCollege, getColleges, updateCollege, deleteCollege } from '../controllers/collegeController';

const router = Router();

/**
 * @openapi
 * /api/colleges:
 *   get:
 *     summary: Get all colleges
 *     tags: [Colleges]
 *     responses:
 *       200:
 *         description: List of colleges
 */
router.get('/', getColleges);

/**
 * @openapi
 * /api/colleges:
 *   post:
 *     summary: Create a new college
 *     tags: [Colleges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               courses:
 *                 type: array
 *                 items:
 *                   type: string
 *               contactEmail:
 *                 type: string
 *     responses:
 *       201:
 *         description: College created
 */
router.post('/', createCollege);

/**
 * @openapi
 * /api/colleges/{id}:
 *   put:
 *     summary: Update a college
 *     tags: [Colleges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: College updated
 */
router.put('/:id', updateCollege);

/**
 * @openapi
 * /api/colleges/{id}:
 *   delete:
 *     summary: Delete a college
 *     tags: [Colleges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: College deleted
 */
router.delete('/:id', deleteCollege);

export default router;
