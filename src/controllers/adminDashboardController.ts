import { Request, Response } from 'express';
import type { PipelineStage } from 'mongoose';
import College from '../models/College';
import Enquiry from '../models/Enquiry';
import CollegeApplication from '../models/CollegeApplication';

const TIME_RANGES = ['daily', 'weekly', 'monthly', 'custom'] as const;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseYear(s: unknown): number | null {
    if (s === undefined || s === null) return null;
    const n = typeof s === 'string' ? parseInt(s, 10) : Number(s);
    return Number.isInteger(n) && n > 0 ? n : null;
}

function parseMonth(s: unknown): number | null {
    if (s === undefined || s === null) return null;
    const n = typeof s === 'string' ? parseInt(s, 10) : Number(s);
    return Number.isInteger(n) && n >= 0 && n <= 11 ? n : null;
}

function parseYears(s: unknown): number[] {
    if (s === undefined || s === null) return [];
    const arr = Array.isArray(s) ? s : [s];
    const out: number[] = [];
    for (const x of arr) {
        const n = typeof x === 'string' ? parseInt(x, 10) : Number(x);
        if (Number.isInteger(n) && n > 0) out.push(n);
    }
    return [...new Set(out)].sort((a, b) => a - b);
}

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

export interface EnquiryAnalyticsItem {
    label: string;
    date?: string;
    count: number;
}

export const getEnquiryAnalytics = async (req: Request, res: Response) => {
    try {
        const timeRange = req.query.timeRange as string;
        if (!timeRange || !TIME_RANGES.includes(timeRange as (typeof TIME_RANGES)[number])) {
            return res.status(400).json({ success: false, error: 'Invalid or missing timeRange; use one of: daily, weekly, monthly, custom' });
        }

        const month = parseMonth(req.query.month);
        const year = parseYear(req.query.year);
        const years = parseYears(req.query.years);
        const startDateRaw = req.query.startDate as string | undefined;
        const endDateRaw = req.query.endDate as string | undefined;

        let matchStart: Date;
        let matchEnd: Date;
        let bucketMode: 'day' | 'week' | 'weekIso' | 'month' = 'month';

        if (timeRange === 'daily' || timeRange === 'weekly') {
            if (year === null || month === null) {
                return res.status(400).json({ success: false, error: 'month (0–11) and year are required for daily and weekly timeRange' });
            }
            matchStart = new Date(year, month, 1, 0, 0, 0, 0);
            matchEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
            bucketMode = timeRange === 'daily' ? 'day' : 'week';
        } else if (timeRange === 'monthly') {
            const yearList = years.length ? years : [new Date().getFullYear()];
            matchStart = new Date(Math.min(...yearList), 0, 1, 0, 0, 0, 0);
            matchEnd = new Date(Math.max(...yearList), 11, 31, 23, 59, 59, 999);
            bucketMode = 'month';
        } else {
            if (!startDateRaw || !endDateRaw) {
                return res.status(400).json({ success: false, error: 'startDate and endDate are required for custom timeRange (ISO 8601)' });
            }
            matchStart = new Date(startDateRaw);
            matchEnd = new Date(endDateRaw);
            if (Number.isNaN(matchStart.getTime()) || Number.isNaN(matchEnd.getTime())) {
                return res.status(400).json({ success: false, error: 'Invalid startDate or endDate' });
            }
            if (matchStart > matchEnd) {
                return res.status(400).json({ success: false, error: 'startDate must be before or equal to endDate' });
            }
            const daysDiff = (matchEnd.getTime() - matchStart.getTime()) / (1000 * 60 * 60 * 24);
            bucketMode = daysDiff > 62 ? 'weekIso' : 'day';
        }

        const pipeline: PipelineStage[] = [
            { $match: { createdAt: { $gte: matchStart, $lte: matchEnd } } },
        ];

        if (bucketMode === 'day') {
            pipeline.push(
                {
                    $group: {
                        _id: {
                            y: { $year: '$createdAt' },
                            m: { $month: '$createdAt' },
                            d: { $dayOfMonth: '$createdAt' },
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
                {
                    $project: {
                        label: {
                            $concat: [
                                { $arrayElemAt: [MONTH_NAMES, { $subtract: ['$_id.m', 1] }] },
                                ' ',
                                { $toString: '$_id.d' },
                                ', ',
                                { $toString: '$_id.y' },
                            ],
                        },
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%dT00:00:00.000Z',
                                date: {
                                    $dateFromParts: { year: '$_id.y', month: '$_id.m', day: '$_id.d' },
                                },
                            },
                        },
                        count: 1,
                        _id: 0,
                    },
                }
            );
        } else if (bucketMode === 'week') {
            pipeline.push(
                {
                    $addFields: {
                        dayOfMonth: { $dayOfMonth: '$createdAt' },
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                },
                {
                    $addFields: {
                        weekOfMonth: { $ceil: { $divide: ['$dayOfMonth', 7] } },
                    },
                },
                {
                    $group: {
                        _id: { year: '$year', month: '$month', weekOfMonth: '$weekOfMonth' },
                        count: { $sum: 1 },
                        firstDay: { $min: '$createdAt' },
                    },
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.weekOfMonth': 1 } },
                {
                    $project: {
                        label: {
                            $concat: [
                                'Week ',
                                { $toString: '$_id.weekOfMonth' },
                                ' (',
                                { $arrayElemAt: [MONTH_NAMES, { $subtract: ['$_id.month', 1] }] },
                                ' ',
                                { $toString: '$_id.year' },
                                ')',
                            ],
                        },
                        date: { $dateToString: { format: '%Y-%m-%dT00:00:00.000Z', date: '$firstDay' } },
                        count: 1,
                        _id: 0,
                    },
                }
            );
        } else if (bucketMode === 'weekIso') {
            pipeline.push(
                {
                    $group: {
                        _id: {
                            isoWeekYear: { $isoWeekYear: '$createdAt' },
                            isoWeek: { $isoWeek: '$createdAt' },
                        },
                        count: { $sum: 1 },
                        firstDay: { $min: '$createdAt' },
                    },
                },
                { $sort: { '_id.isoWeekYear': 1, '_id.isoWeek': 1 } },
                {
                    $project: {
                        label: {
                            $concat: [
                                'Week ',
                                { $toString: '$_id.isoWeek' },
                                ', ',
                                { $toString: '$_id.isoWeekYear' },
                            ],
                        },
                        date: { $dateToString: { format: '%Y-%m-%dT00:00:00.000Z', date: '$firstDay' } },
                        count: 1,
                        _id: 0,
                    },
                }
            );
        } else {
            pipeline.push(
                {
                    $group: {
                        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } },
                {
                    $project: {
                        label: {
                            $concat: [
                                { $arrayElemAt: [MONTH_NAMES, { $subtract: ['$_id.month', 1] }] },
                                ' ',
                                { $toString: '$_id.year' },
                            ],
                        },
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%dT00:00:00.000Z',
                                date: {
                                    $dateFromParts: { year: '$_id.year', month: '$_id.month', day: 1 },
                                },
                            },
                        },
                        count: 1,
                        _id: 0,
                    },
                }
            );
        }

        const enquiries = (await Enquiry.aggregate(pipeline)) as EnquiryAnalyticsItem[];
        res.json({ success: true, data: { enquiries } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching enquiry analytics' });
    }
};
