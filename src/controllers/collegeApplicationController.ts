import { Request, Response } from 'express';
import CollegeApplication from '../models/CollegeApplication';

export const submitCollegeApplication = async (req: Request, res: Response) => {
    try {
        const { collegeId, email, phone, name } = req.body;
        if (!collegeId || !email || !phone) {
            return res.status(400).json({ success: false, error: 'collegeId, email and phone are required' });
        }
        const application = new CollegeApplication({
            collegeId,
            email,
            phone,
            name: name || undefined,
            status: 'submitted',
        });
        await application.save();
        res.status(201).json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error submitting application' });
    }
};
