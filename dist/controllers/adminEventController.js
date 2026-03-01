"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.getEventById = exports.createEvent = exports.listEvents = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Event_1 = __importDefault(require("../models/Event"));
function parseDate(val) {
    if (val == null)
        return null;
    const d = new Date(String(val));
    return isNaN(d.getTime()) ? null : d;
}
const listEvents = async (req, res) => {
    try {
        const { page = '1', limit = '20', sort = 'startDate' } = req.query;
        const pageNum = Math.max(1, parseInt(String(page), 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
        const skip = (pageNum - 1) * limitNum;
        const sortOrder = sort === 'endDate' ? { endDate: 1 } : { startDate: 1 };
        const [events, total] = await Promise.all([
            Event_1.default.find({}).sort(sortOrder).skip(skip).limit(limitNum).lean(),
            Event_1.default.countDocuments(),
        ]);
        const totalPages = Math.ceil(total / limitNum);
        res.json({
            success: true,
            data: {
                events,
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
        res.status(500).json({ success: false, error: 'Error fetching events' });
    }
};
exports.listEvents = listEvents;
const createEvent = async (req, res) => {
    try {
        const { name, startDate, endDate, shortDescription, longDescription, imageUrl, venue, isActive } = req.body;
        const nameStr = typeof name === 'string' ? name.trim() : '';
        if (!nameStr) {
            return res.status(400).json({ success: false, error: 'name is required' });
        }
        const start = parseDate(startDate);
        const end = parseDate(endDate);
        if (!start) {
            return res.status(400).json({ success: false, error: 'startDate is required and must be a valid date' });
        }
        if (!end) {
            return res.status(400).json({ success: false, error: 'endDate is required and must be a valid date' });
        }
        if (end < start) {
            return res.status(400).json({ success: false, error: 'endDate must be on or after startDate' });
        }
        const event = new Event_1.default({
            name: nameStr,
            startDate: start,
            endDate: end,
            shortDescription: typeof shortDescription === 'string' ? shortDescription.trim() || undefined : undefined,
            longDescription: typeof longDescription === 'string' ? longDescription.trim() || undefined : undefined,
            imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() || undefined : undefined,
            venue: typeof venue === 'string' ? venue.trim() || undefined : undefined,
            isActive: isActive !== false,
        });
        await event.save();
        res.status(201).json({ success: true, data: event });
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            const message = Object.values(error.errors).map((e) => e.message).join('; ');
            return res.status(400).json({ success: false, error: message });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.createEvent = createEvent;
const getEventById = async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Event not found', code: 'EVENT_NOT_FOUND' });
        }
        const event = await Event_1.default.findById(id).lean();
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found', code: 'EVENT_NOT_FOUND' });
        }
        res.json({ success: true, data: event });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.getEventById = getEventById;
const updateEvent = async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Event not found', code: 'EVENT_NOT_FOUND' });
        }
        const { name, startDate, endDate, shortDescription, longDescription, imageUrl, venue, isActive } = req.body;
        const updates = {};
        if (name !== undefined)
            updates.name = typeof name === 'string' ? name.trim() : name;
        if (startDate !== undefined) {
            const start = parseDate(startDate);
            if (start)
                updates.startDate = start;
        }
        if (endDate !== undefined) {
            const end = parseDate(endDate);
            if (end)
                updates.endDate = end;
        }
        if (shortDescription !== undefined)
            updates.shortDescription = typeof shortDescription === 'string' ? shortDescription.trim() || null : shortDescription;
        if (longDescription !== undefined)
            updates.longDescription = typeof longDescription === 'string' ? longDescription.trim() || null : longDescription;
        if (imageUrl !== undefined)
            updates.imageUrl = typeof imageUrl === 'string' ? imageUrl.trim() || null : imageUrl;
        if (venue !== undefined)
            updates.venue = typeof venue === 'string' ? venue.trim() || null : venue;
        if (isActive !== undefined)
            updates.isActive = isActive !== false;
        const existing = await Event_1.default.findById(id).lean();
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Event not found', code: 'EVENT_NOT_FOUND' });
        }
        const finalStart = updates.startDate ?? existing.startDate;
        const finalEnd = updates.endDate ?? existing.endDate;
        if (new Date(finalEnd) < new Date(finalStart)) {
            return res.status(400).json({ success: false, error: 'endDate must be on or after startDate' });
        }
        const event = await Event_1.default.findByIdAndUpdate(id, updates, { new: true }).lean();
        res.json({ success: true, data: event });
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            const message = Object.values(error.errors).map((e) => e.message).join('; ');
            return res.status(400).json({ success: false, error: message });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Event not found', code: 'EVENT_NOT_FOUND' });
        }
        const event = await Event_1.default.findByIdAndDelete(id);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found', code: 'EVENT_NOT_FOUND' });
        }
        res.json({ success: true, message: 'Event deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.deleteEvent = deleteEvent;
//# sourceMappingURL=adminEventController.js.map