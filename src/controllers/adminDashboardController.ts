import { Request, Response } from 'express';
import College from '../models/College';
import CounsellingEnquiry from '../models/CounsellingEnquiry';
import CollegeApplication from '../models/CollegeApplication';

export const getDashboardCounts = async (_req: Request, res: Response) => {
    try {
        const [collegesTotal, collegesActive, enquiriesNew, enquiriesTotal, applicationsTotal] = await Promise.all([
            College.countDocuments(),
            College.countDocuments({ isActive: true }),
            CounsellingEnquiry.countDocuments({ status: 'new' }),
            CounsellingEnquiry.countDocuments(),
            CollegeApplication.countDocuments(),
        ]);

        res.json({
            success: true,
            data: {
                colleges: { total: collegesTotal, active: collegesActive },
                enquiries: { total: enquiriesTotal, new: enquiriesNew },
                applications: { total: applicationsTotal },
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching dashboard' });
    }
};
