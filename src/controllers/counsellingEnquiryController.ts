import { Request, Response } from 'express';
import CounsellingEnquiry from '../models/CounsellingEnquiry';

export const submitCounsellingEnquiry = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, courseInterest, currentStatus, message, collegeId, source } = req.body;
        if (!name || !email || !phone) {
            return res.status(400).json({ success: false, error: 'name, email and phone are required' });
        }
        const enquiry = new CounsellingEnquiry({
            name,
            email,
            phone,
            courseInterest: courseInterest || undefined,
            currentStatus: currentStatus || undefined,
            message: message || undefined,
            collegeId: collegeId || undefined,
            status: 'new',
            source: source || 'cta',
        });
        await enquiry.save();
        res.status(201).json({ success: true, message: 'Enquiry submitted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error submitting enquiry' });
    }
};
