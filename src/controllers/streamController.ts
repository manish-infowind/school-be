import { Request, Response } from 'express';
import College from '../models/College';
import Course from '../models/Course';

/** Stream = Course (B.Tech, MBA, etc.). id = Course._id for linking to colleges?courseId= */
export interface StreamItem {
    id: string;
    name: string;
    slug: string;
    collegeCount: number;
    iconUrl: string | null;
    iconKey: string | null;
}

/**
 * Get college counts per course name (active colleges whose courses array contains that name).
 */
async function getCollegeCountByCourseName(): Promise<Map<string, number>> {
    const aggregates = await College.aggregate<{ _id: string; count: number }>([
        { $match: { isActive: true } },
        { $unwind: '$courses' },
        { $group: { _id: '$courses', count: { $sum: 1 } } },
    ]);
    const map = new Map<string, number>();
    for (const a of aggregates) {
        const name = String(a._id).trim();
        if (name) map.set(name, a.count);
    }
    return map;
}

/**
 * GET /api/streams/popular – list popular streams from Course collection.
 * Each stream = one Course; collegeCount = colleges that offer that course (courses array contains course name).
 */
export const listPopularStreams = async (req: Request, res: Response) => {
    try {
        const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || 9), 10))) || 9;

        const [courses, nameToCount] = await Promise.all([
            Course.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
            getCollegeCountByCourseName(),
        ]);

        const withCount: StreamItem[] = courses
            .map((c) => {
                const name = (c as { name: string }).name;
                const count = nameToCount.get(name) ?? 0;
                return {
                    id: String((c as { _id: unknown })._id),
                    name,
                    slug: (c as { slug: string }).slug,
                    collegeCount: count,
                    iconUrl: null,
                    iconKey: (c as { slug: string }).slug,
                };
            })
            .filter((s) => s.collegeCount > 0)
            .sort((a, b) => b.collegeCount - a.collegeCount)
            .slice(0, limit);

        res.json({ success: true, data: withCount });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * GET /api/streams – list all streams (Course-based) with pagination, sort, search.
 */
export const listStreams = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(String(req.query.page || 1), 10));
        const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || 20), 10)));
        const sortBy = String(req.query.sortBy || 'collegeCount').toLowerCase();
        const order = String(req.query.order || 'desc').toLowerCase() === 'asc' ? 1 : -1;
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

        const [courses, nameToCount] = await Promise.all([
            Course.find({ isActive: true })
                .sort({ sortOrder: 1, name: 1 })
                .lean(),
            getCollegeCountByCourseName(),
        ]);

        let streams: StreamItem[] = courses.map((c) => {
            const name = (c as { name: string }).name;
            return {
                id: String((c as { _id: unknown })._id),
                name,
                slug: (c as { slug: string }).slug,
                collegeCount: nameToCount.get(name) ?? 0,
                iconUrl: null,
                iconKey: (c as { slug: string }).slug,
            };
        });

        if (search) {
            const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            streams = streams.filter((s) => re.test(s.name));
        }

        const total = streams.length;
        const sortField = sortBy === 'name' ? 'name' : 'collegeCount';
        streams.sort((a, b) => {
            const aVal = sortField === 'name' ? a.name : a.collegeCount;
            const bVal = sortField === 'name' ? b.name : b.collegeCount;
            if (aVal < bVal) return order;
            if (aVal > bVal) return -order;
            return 0;
        });

        const start = (page - 1) * limit;
        const paginated = streams.slice(start, start + limit);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                streams: paginated,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
