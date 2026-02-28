import { Request, Response } from 'express';
import CounsellingEnquiry from '../models/CounsellingEnquiry';

export const listEnquiries = async (req: Request, res: Response) => {
    try {
        const { status, page = '1', limit = '20' } = req.query;
        const pageNum = Math.max(1, parseInt(String(page), 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
        const skip = (pageNum - 1) * limitNum;

        const filter: Record<string, unknown> = {};
        if (status) filter.status = status;

        const [enquiries, total] = await Promise.all([
            CounsellingEnquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
            CounsellingEnquiry.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: {
                enquiries,
                pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching enquiries' });
    }
};

export const updateEnquiry = async (req: Request, res: Response) => {
    try {
        const { status, notes } = req.body;
        const updates: Record<string, unknown> = {};
        if (status !== undefined) updates.status = status;
        if (notes !== undefined) updates.notes = notes;
        const enquiry = await CounsellingEnquiry.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!enquiry) {
            return res.status(404).json({ success: false, error: 'Enquiry not found' });
        }
        res.json({ success: true, data: enquiry });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error updating enquiry' });
    }
};
