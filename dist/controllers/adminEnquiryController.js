"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEnquiry = exports.getEnquiryById = exports.listEnquiries = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Enquiry_1 = __importDefault(require("../models/Enquiry"));
const Enquiry_2 = require("../models/Enquiry");
function parseDate(val) {
    if (val == null)
        return null;
    const d = new Date(String(val));
    return isNaN(d.getTime()) ? null : d;
}
/**
 * List enquiries for admin. Latest first by default. Optional filters: status, date range.
 */
const listEnquiries = async (req, res) => {
    try {
        const { status, fromDate, toDate, page = '1', limit = '20', sort = 'newest' } = req.query;
        const pageNum = Math.max(1, parseInt(String(page), 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
        const skip = (pageNum - 1) * limitNum;
        const filter = {};
        if (status && String(status).trim() && Enquiry_2.ENQUIRY_STATUSES.includes(String(status).trim())) {
            filter.status = String(status).trim();
        }
        const from = parseDate(fromDate);
        const to = parseDate(toDate);
        if (from || to) {
            filter.createdAt = {};
            if (from)
                filter.createdAt.$gte = from;
            if (to)
                filter.createdAt.$lte = to;
        }
        const sortOrder = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
        const [enquiries, total] = await Promise.all([
            Enquiry_1.default.find(filter)
                .populate('courseId', 'name slug')
                .sort(sortOrder)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Enquiry_1.default.countDocuments(filter),
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching enquiries' });
    }
};
exports.listEnquiries = listEnquiries;
/**
 * Get a single enquiry by ID (admin).
 */
const getEnquiryById = async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Enquiry not found', code: 'ENQUIRY_NOT_FOUND' });
        }
        const enquiry = await Enquiry_1.default.findById(id).populate('courseId', 'name slug').lean();
        if (!enquiry) {
            return res.status(404).json({ success: false, error: 'Enquiry not found', code: 'ENQUIRY_NOT_FOUND' });
        }
        res.json({ success: true, data: enquiry });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.getEnquiryById = getEnquiryById;
/**
 * Update enquiry (admin): status and optional notes.
 */
const updateEnquiry = async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Enquiry not found', code: 'ENQUIRY_NOT_FOUND' });
        }
        const { status, notes } = req.body;
        const updates = {};
        if (status !== undefined) {
            if (!Enquiry_2.ENQUIRY_STATUSES.includes(status)) {
                return res.status(400).json({ success: false, error: 'Invalid status. Use: pending, reviewed, resolved' });
            }
            updates.status = status;
        }
        if (notes !== undefined)
            updates.notes = notes;
        const enquiry = await Enquiry_1.default.findByIdAndUpdate(id, updates, { new: true })
            .populate('courseId', 'name slug')
            .lean();
        if (!enquiry) {
            return res.status(404).json({ success: false, error: 'Enquiry not found', code: 'ENQUIRY_NOT_FOUND' });
        }
        res.json({ success: true, data: enquiry });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.updateEnquiry = updateEnquiry;
//# sourceMappingURL=adminEnquiryController.js.map