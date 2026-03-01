import { Request, Response } from 'express';
import College from '../models/College';
import Enquiry from '../models/Enquiry';
import CollegeApplication from '../models/CollegeApplication';

export const getDashboardCounts = async (_req: Request, res: Response) => {
    try {
        const [collegesTotal, collegesActive, enquiriesPending, enquiriesTotal, applicationsTotal] = await Promise.all([
            College.countDocuments(),
            College.countDocuments({ isActive: true }),
            Enquiry.countDocuments({ status: 'pending' }),
            Enquiry.countDocuments(),
            CollegeApplication.countDocuments(),
        ]);

        res.json({
            success: true,
            data: {
                colleges: { total: collegesTotal, active: collegesActive },
                enquiries: { total: enquiriesTotal, pending: enquiriesPending },
                applications: { total: applicationsTotal },
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching dashboard' });
    }
};
