import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Enquiry from '../models/Enquiry';
import { ENQUIRY_STATUSES } from '../models/Enquiry';

function parseDate(val: unknown): Date | null {
    if (val == null) return null;
    const d = new Date(String(val));
    return isNaN(d.getTime()) ? null : d;
}

/**
 * List enquiries for admin. Latest first by default. Optional filters: status, date range.
 */
export const listEnquiries = async (req: Request, res: Response) => {
    try {
        const { status, fromDate, toDate, page = '1', limit = '20', sort = 'newest' } = req.query;
        const pageNum = Math.max(1, parseInt(String(page), 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
        const skip = (pageNum - 1) * limitNum;

        const filter: Record<string, unknown> = {};

        if (status && String(status).trim() && ENQUIRY_STATUSES.includes(String(status).trim() as (typeof ENQUIRY_STATUSES)[number])) {
            filter.status = String(status).trim();
        }

        const from = parseDate(fromDate);
        const to = parseDate(toDate);
        if (from || to) {
            filter.createdAt = {};
            if (from) (filter.createdAt as Record<string, Date>).$gte = from;
            if (to) (filter.createdAt as Record<string, Date>).$lte = to;
        }

        const sortOrder = sort === 'oldest' ? { createdAt: 1 as const } : { createdAt: -1 as const };

        const [enquiries, total] = await Promise.all([
            Enquiry.find(filter)
                .populate('courseId', 'name slug')
                .sort(sortOrder)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Enquiry.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limitNum);
        res.json({
            success: true,
            data: {
                enquiries,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1,
                },
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching enquiries' });
    }
};

/**
 * Get a single enquiry by ID (admin).
 */
export const getEnquiryById = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Enquiry not found', code: 'ENQUIRY_NOT_FOUND' });
        }
        const enquiry = await Enquiry.findById(id).populate('courseId', 'name slug').lean();
        if (!enquiry) {
            return res.status(404).json({ success: false, error: 'Enquiry not found', code: 'ENQUIRY_NOT_FOUND' });
        }
        res.json({ success: true, data: enquiry });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * Update enquiry (admin): status and optional notes.
 */
export const updateEnquiry = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Enquiry not found', code: 'ENQUIRY_NOT_FOUND' });
        }
        const { status, notes } = req.body;
        const updates: Record<string, unknown> = {};
        if (status !== undefined) {
            if (!ENQUIRY_STATUSES.includes(status)) {
                return res.status(400).json({ success: false, error: 'Invalid status. Use: pending, reviewed, resolved' });
            }
            updates.status = status;
        }
        if (notes !== undefined) updates.notes = notes;

        const enquiry = await Enquiry.findByIdAndUpdate(id, updates, { new: true })
            .populate('courseId', 'name slug')
            .lean();
        if (!enquiry) {
            return res.status(404).json({ success: false, error: 'Enquiry not found', code: 'ENQUIRY_NOT_FOUND' });
        }
        res.json({ success: true, data: enquiry });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
