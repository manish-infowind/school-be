"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStreams = exports.listPopularStreams = void 0;
const College_1 = __importDefault(require("../models/College"));
const Course_1 = __importDefault(require("../models/Course"));
/**
 * Get college counts per course name (active colleges whose courses array contains that name).
 */
async function getCollegeCountByCourseName() {
    const aggregates = await College_1.default.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$courses' },
        { $group: { _id: '$courses', count: { $sum: 1 } } },
    ]);
    const map = new Map();
    for (const a of aggregates) {
        const name = String(a._id).trim();
        if (name)
            map.set(name, a.count);
    }
    return map;
}
/**
 * GET /api/streams/popular – list popular streams from Course collection.
 * Each stream = one Course; collegeCount = colleges that offer that course (courses array contains course name).
 */
const listPopularStreams = async (req, res) => {
    try {
        const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || 9), 10))) || 9;
        const [courses, nameToCount] = await Promise.all([
            Course_1.default.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
            getCollegeCountByCourseName(),
        ]);
        const withCount = courses
            .map((c) => {
            const name = c.name;
            const count = nameToCount.get(name) ?? 0;
            return {
                id: String(c._id),
                name,
                slug: c.slug,
                collegeCount: count,
                iconUrl: null,
                iconKey: c.slug,
            };
        })
            .filter((s) => s.collegeCount > 0)
            .sort((a, b) => b.collegeCount - a.collegeCount)
            .slice(0, limit);
        res.json({ success: true, data: withCount });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.listPopularStreams = listPopularStreams;
/**
 * GET /api/streams – list all streams (Course-based) with pagination, sort, search.
 */
const listStreams = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(String(req.query.page || 1), 10));
        const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || 20), 10)));
        const sortBy = String(req.query.sortBy || 'collegeCount').toLowerCase();
        const order = String(req.query.order || 'desc').toLowerCase() === 'asc' ? 1 : -1;
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        const [courses, nameToCount] = await Promise.all([
            Course_1.default.find({ isActive: true })
                .sort({ sortOrder: 1, name: 1 })
                .lean(),
            getCollegeCountByCourseName(),
        ]);
        let streams = courses.map((c) => {
            const name = c.name;
            return {
                id: String(c._id),
                name,
                slug: c.slug,
                collegeCount: nameToCount.get(name) ?? 0,
                iconUrl: null,
                iconKey: c.slug,
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
            if (aVal < bVal)
                return order;
            if (aVal > bVal)
                return -order;
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.listStreams = listStreams;
//# sourceMappingURL=streamController.js.map