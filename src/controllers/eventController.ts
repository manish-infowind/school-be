import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event';

const todayStart = (): Date => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};
const endOfToday = (): Date => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
};

function getStatus(startDate: Date, endDate: Date): 'running' | 'upcoming' {
    const today = todayStart();
    const end = endOfToday();
    const start = new Date(startDate);
    const endD = new Date(endDate);
    if (start <= end && endD >= today) return 'running';
    return 'upcoming';
}

/**
 * List events for customer portal: currently running and upcoming. Paginated. Only active events.
 */
export const listUpcomingAndRunningEvents = async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '12' } = req.query;
        const pageNum = Math.max(1, parseInt(String(page), 10));
        const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10)));
        const skip = (pageNum - 1) * limitNum;

        const today = todayStart();
        const events = await Event.find({
            isActive: true,
            endDate: { $gte: today },
        })
            .sort({ startDate: 1 })
            .select('_id name startDate endDate shortDescription imageUrl venue')
            .skip(skip)
            .limit(limitNum)
            .lean();

        const end = endOfToday();
        const list = events.map((e) => ({
            id: e._id,
            name: e.name,
            startDate: e.startDate,
            endDate: e.endDate,
            shortDescription: e.shortDescription ?? null,
            imageUrl: e.imageUrl ?? null,
            venue: e.venue ?? null,
            status: getStatus(e.startDate, e.endDate),
        }));

        const total = await Event.countDocuments({
            isActive: true,
            endDate: { $gte: today },
        });
        const totalPages = Math.ceil(total / limitNum);

        res.json({
            success: true,
            data: {
                events: list,
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
        res.status(500).json({ success: false, error: 'Error fetching events' });
    }
};

/**
 * Get single event details for customer portal. Only active events that are running or upcoming.
 */
export const getEventDetails = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Event not found', code: 'EVENT_NOT_FOUND' });
        }
        const event = await Event.findOne({
            _id: id,
            isActive: true,
            endDate: { $gte: todayStart() },
        })
            .select('_id name startDate endDate shortDescription longDescription imageUrl venue createdAt updatedAt')
            .lean();

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found', code: 'EVENT_NOT_FOUND' });
        }

        const status = getStatus(event.startDate, event.endDate);
        res.json({
            success: true,
            data: {
                id: event._id,
                name: event.name,
                startDate: event.startDate,
                endDate: event.endDate,
                shortDescription: event.shortDescription ?? null,
                longDescription: event.longDescription ?? null,
                imageUrl: event.imageUrl ?? null,
                venue: event.venue ?? null,
                status,
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
