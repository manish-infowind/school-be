"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCollege = exports.updateCollegeStatus = exports.updateCollege = exports.adminListColleges = exports.getCollegeById = exports.createCollege = exports.getCollegeBySlug = exports.listColleges = void 0;
const College_1 = __importDefault(require("../models/College"));
const Course_1 = __importDefault(require("../models/Course"));
const Country_1 = __importDefault(require("../models/Country"));
const State_1 = __importDefault(require("../models/State"));
const City_1 = __importDefault(require("../models/City"));
const slugify_1 = require("../utils/slugify");
const mongoose_1 = __importDefault(require("mongoose"));
const College_2 = require("../models/College");
/** Resolve stream slug (e.g. engineering) to college category name (e.g. Engineering). */
function getCategoryByStreamSlug(slug) {
    const s = String(slug).trim().toLowerCase();
    if (!s)
        return null;
    const found = College_2.COLLEGE_CATEGORIES.find((cat) => (0, slugify_1.slugify)(cat) === s);
    return found ?? null;
}
const SORT_OPTIONS = ['name_asc', 'name_desc', 'fee_asc', 'fee_desc', 'rating_desc', 'nirf_asc', 'newest', 'relevance'];
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;
const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;
function isValidObjectId(id) {
    return typeof id === 'string' && OBJECT_ID_REGEX.test(id.trim());
}
function parsePage(val) {
    const n = parseInt(String(val ?? 1), 10);
    return Number.isNaN(n) || n < 1 ? 1 : n;
}
function parseLimit(val) {
    const n = parseInt(String(val ?? DEFAULT_LIMIT), 10);
    if (Number.isNaN(n) || n < 1)
        return DEFAULT_LIMIT;
    return Math.min(n, MAX_LIMIT);
}
function parseSort(val) {
    const s = String(val ?? 'name_asc').trim();
    return SORT_OPTIONS.includes(s) ? s : 'name_asc';
}
function buildSearchFilter(searchStr) {
    const tokens = searchStr.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0)
        return {};
    const orConditions = tokens.map((token) => {
        const re = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        return {
            $or: [
                { name: re },
                { locationDisplay: re },
                { stateName: re },
                { cityName: re },
                { description: re },
                { shortName: re },
                { badge: re },
                { courses: re },
            ],
        };
    });
    return { $and: orConditions };
}
function getSortStage(sort, hasSearch) {
    switch (sort) {
        case 'name_asc':
            return { name: 1 };
        case 'name_desc':
            return { name: -1 };
        case 'fee_asc':
            return { feeAmount: 1 };
        case 'fee_desc':
            return { feeAmount: -1 };
        case 'rating_desc':
            return { rating: -1 };
        case 'nirf_asc':
            return { nirfRank: 1 };
        case 'newest':
            return { createdAt: -1 };
        case 'relevance':
            return hasSearch ? { createdAt: -1 } : { name: 1 };
        default:
            return { name: 1 };
    }
}
/** Format fee for display: feeAmount + feePeriod -> e.g. "₹2.5L/yr". */
function formatFeeDisplay(feeAmount, feePeriod) {
    if (feeAmount == null || Number.isNaN(feeAmount))
        return '';
    const period = feePeriod === 'semester' ? '/sem' : '/yr';
    if (feeAmount >= 100000) {
        const l = (feeAmount / 100000).toFixed(1).replace(/\.0$/, '');
        return `₹${l}L${period}`;
    }
    return `₹${feeAmount.toLocaleString('en-IN')}${period}`;
}
function toListItem(doc) {
    const location = doc.locationDisplay || `${doc.cityName || ''}, ${doc.stateName || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || null;
    let feeDisplay = (doc.fee && String(doc.fee).trim()) || '';
    if (!feeDisplay && (doc.feeAmount != null || (Array.isArray(doc.courseFees) && doc.courseFees.length > 0))) {
        if (doc.feeAmount != null) {
            feeDisplay = formatFeeDisplay(doc.feeAmount, doc.feePeriod);
        }
        else if (Array.isArray(doc.courseFees) && doc.courseFees.length > 0) {
            const first = doc.courseFees[0];
            feeDisplay = (first.fee && String(first.fee).trim()) || formatFeeDisplay(first.feeAmount, first.feePeriod);
        }
    }
    const rawCourseFees = Array.isArray(doc.courseFees) ? doc.courseFees : [];
    const courseFees = rawCourseFees.map((cf) => ({
        course: cf.courseName ?? '',
        fee: (cf.fee && String(cf.fee).trim()) || formatFeeDisplay(cf.feeAmount, cf.feePeriod) || '',
    })).filter((c) => c.course);
    return {
        id: doc.slug,
        name: doc.name,
        shortName: doc.shortName ?? null,
        location: location || `${doc.cityName || ''}, ${doc.stateName || ''}`.trim(),
        state: doc.stateName ?? '',
        city: doc.cityName ?? '',
        stateId: doc.stateId ? String(doc.stateId) : null,
        cityId: doc.cityId ? String(doc.cityId) : null,
        category: doc.category,
        courses: Array.isArray(doc.courses) ? doc.courses : [],
        courseFees,
        fee: feeDisplay,
        feeAmount: doc.feeAmount ?? null,
        feePeriod: doc.feePeriod ?? null,
        badge: doc.badge ?? '',
        description: doc.description ?? null,
        logoUrl: doc.logoUrl ?? null,
        coverImageUrl: doc.coverImageUrl ?? null,
        isVerified: !!doc.isVerified,
    };
}
function toDetailPayload(doc) {
    const location = doc.locationDisplay || `${doc.cityName || ''}, ${doc.stateName || ''}`.replace(/^,\s*|,\s*$/g, '').trim();
    const rawCourseFees = Array.isArray(doc.courseFees) ? doc.courseFees : [];
    const courseFees = rawCourseFees
        .map((cf) => ({
        course: String(cf.courseName ?? cf.course ?? ''),
        fee: String(cf.fee ?? ''),
    }))
        .filter((cf) => cf.course.length > 0);
    return {
        id: doc.slug,
        slug: doc.slug,
        name: doc.name,
        shortName: doc.shortName ?? null,
        location: location || `${doc.cityName || ''}, ${doc.stateName || ''}`.trim(),
        state: doc.stateName ?? '',
        city: doc.cityName ?? '',
        stateId: doc.stateId ? String(doc.stateId) : null,
        cityId: doc.cityId ? String(doc.cityId) : null,
        category: doc.category,
        courses: Array.isArray(doc.courses) ? doc.courses : [],
        courseFees,
        fee: doc.fee ?? '',
        feeAmount: doc.feeAmount ?? null,
        feePeriod: doc.feePeriod ?? null,
        badge: doc.badge ?? null,
        description: doc.description ?? null,
        highlights: Array.isArray(doc.highlights) ? doc.highlights : [],
        eligibility: doc.eligibility ?? null,
        facilities: Array.isArray(doc.facilities) ? doc.facilities : [],
        website: doc.website ?? null,
        phone: doc.phone ?? null,
        email: doc.email ?? null,
        address: doc.address ?? null,
        pinCode: doc.pinCode ?? null,
        logoUrl: doc.logoUrl ?? null,
        coverImageUrl: doc.coverImageUrl ?? null,
        galleryUrls: Array.isArray(doc.galleryUrls) ? doc.galleryUrls : [],
        rating: doc.rating ?? null,
        nirfRank: doc.nirfRank ?? null,
        placementRate: doc.placementRate ?? null,
        avgPackage: doc.avgPackage ?? null,
        isVerified: !!doc.isVerified,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
// ----- Public (no auth) -----
const listColleges = async (req, res) => {
    try {
        const { category, state, stateId, city, cityId, courseId, stream, search, sort, verified, page, limit } = req.query;
        const validationErrors = [];
        if (stateId && !isValidObjectId(String(stateId))) {
            validationErrors.push({ field: 'stateId', message: 'Invalid stateId format (24-char hex)' });
        }
        if (cityId && !isValidObjectId(String(cityId))) {
            validationErrors.push({ field: 'cityId', message: 'Invalid cityId format (24-char hex)' });
        }
        if (courseId && !isValidObjectId(String(courseId))) {
            validationErrors.push({ field: 'courseId', message: 'Invalid courseId format (24-char hex)' });
        }
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: validationErrors,
            });
        }
        const pageNum = parsePage(page);
        const limitNum = parseLimit(limit);
        const skip = (pageNum - 1) * limitNum;
        const sortOption = parseSort(sort);
        const searchStr = typeof search === 'string' ? search.trim() : '';
        const hasSearch = searchStr.length > 0;
        const filter = { isActive: true };
        if (category && String(category).trim() && String(category).trim() !== 'All') {
            const cat = String(category).trim();
            if (College_2.COLLEGE_CATEGORIES.includes(cat)) {
                filter.category = cat;
            }
        }
        else if (stream && String(stream).trim()) {
            const categoryFromStream = getCategoryByStreamSlug(String(stream).trim());
            if (categoryFromStream)
                filter.category = categoryFromStream;
        }
        if (stateId && isValidObjectId(String(stateId))) {
            filter.stateId = new mongoose_1.default.Types.ObjectId(String(stateId));
        }
        else if (state && String(state).trim()) {
            filter.stateName = new RegExp(String(state).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        }
        if (cityId && isValidObjectId(String(cityId))) {
            filter.cityId = new mongoose_1.default.Types.ObjectId(String(cityId));
        }
        else if (city && String(city).trim()) {
            filter.cityName = new RegExp(String(city).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        }
        if (courseId && isValidObjectId(String(courseId))) {
            const courseDoc = await Course_1.default.findById(courseId).select('name').lean();
            if (courseDoc && typeof courseDoc.name === 'string') {
                filter.courses = courseDoc.name;
            }
        }
        const verifiedStr = String(verified ?? '');
        if (verifiedStr === 'true')
            filter.isVerified = true;
        else if (verifiedStr === 'false')
            filter.isVerified = false;
        const searchFilter = hasSearch ? buildSearchFilter(searchStr) : {};
        const fullFilter = Object.keys(searchFilter).length > 0 ? { $and: [filter, searchFilter] } : filter;
        const sortStage = getSortStage(sortOption, hasSearch);
        const query = College_1.default.find(fullFilter);
        const [colleges, total] = await Promise.all([
            query.clone().sort(sortStage).skip(skip).limit(limitNum).lean(),
            query.clone().countDocuments(),
        ]);
        const totalPages = Math.ceil(total / limitNum);
        const listItems = colleges.map(toListItem);
        res.json({
            success: true,
            data: {
                colleges: listItems,
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
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.listColleges = listColleges;
const getCollegeBySlug = async (req, res) => {
    try {
        const slug = String(req.params.slug ?? '').trim();
        if (!slug) {
            return res.status(404).json({
                success: false,
                error: 'College not found',
                code: 'COLLEGE_NOT_FOUND',
            });
        }
        const college = await College_1.default.findOne({ slug, isActive: true }).lean();
        if (!college) {
            return res.status(404).json({
                success: false,
                error: 'College not found',
                code: 'COLLEGE_NOT_FOUND',
            });
        }
        res.json({ success: true, data: toDetailPayload(college) });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.getCollegeBySlug = getCollegeBySlug;
// ----- Admin (used by admin routes with auth) -----
/** Resolve stateName, cityName, locationDisplay from stateId and cityId (for admin create/update). */
async function resolveLocationFromIds(stateId, cityId) {
    if (!stateId && !cityId)
        return {};
    const sid = stateId ? new mongoose_1.default.Types.ObjectId(String(stateId)) : null;
    const cid = cityId ? new mongoose_1.default.Types.ObjectId(String(cityId)) : null;
    const [state, city] = await Promise.all([
        sid ? State_1.default.findById(sid).select('name').lean() : Promise.resolve(null),
        cid ? City_1.default.findById(cid).select('name').lean() : Promise.resolve(null),
    ]);
    const stateName = state && 'name' in state ? state.name : undefined;
    const cityName = city && 'name' in city ? city.name : undefined;
    const locationDisplay = cityName !== undefined && stateName !== undefined
        ? `${cityName}, ${stateName}`
        : stateName ?? cityName ?? undefined;
    return { stateName, cityName, locationDisplay };
}
function normalizeArrayField(val) {
    if (Array.isArray(val))
        return val.filter((v) => typeof v === 'string');
    if (typeof val === 'string')
        return val.trim() ? [val] : [];
    return [];
}
function normalizeCourseFees(val) {
    if (!Array.isArray(val))
        return [];
    return val
        .filter((v) => v != null && typeof v === 'object')
        .map((v) => ({
        courseName: typeof v.courseName === 'string' ? v.courseName.trim() : '',
        fee: typeof v.fee === 'string' ? v.fee : undefined,
        feeAmount: typeof v.feeAmount === 'number' && !Number.isNaN(v.feeAmount) ? v.feeAmount : undefined,
        feePeriod: v.feePeriod === 'year' || v.feePeriod === 'semester' ? v.feePeriod : undefined,
    }))
        .filter((c) => c.courseName.length > 0);
}
function sanitizeCollegeBody(body) {
    const out = { ...body };
    if (out.courseFees !== undefined) {
        out.courseFees = normalizeCourseFees(out.courseFees);
        out.courses = out.courseFees.map((c) => c.courseName);
    }
    else if (out.courses !== undefined) {
        out.courses = normalizeArrayField(out.courses);
    }
    if (out.highlights !== undefined)
        out.highlights = normalizeArrayField(out.highlights);
    if (out.facilities !== undefined)
        out.facilities = normalizeArrayField(out.facilities);
    if (out.galleryUrls !== undefined)
        out.galleryUrls = normalizeArrayField(out.galleryUrls);
    return out;
}
const createCollege = async (req, res) => {
    try {
        const raw = req.body;
        const body = sanitizeCollegeBody(raw);
        const name = String(body.name || '');
        if (!name) {
            return res.status(400).json({ success: false, error: 'name is required' });
        }
        if (!body.countryId) {
            const india = await Country_1.default.findOne({ code: 'IN' }).select('_id').lean();
            if (india)
                body.countryId = india._id.toString();
            else
                return res.status(400).json({ success: false, error: 'countryId is required' });
        }
        const stateId = body.stateId;
        const cityId = body.cityId;
        if (stateId || cityId) {
            const needLocation = body.stateName === undefined || body.cityName === undefined || body.locationDisplay === undefined;
            if (needLocation) {
                const resolved = await resolveLocationFromIds(stateId, cityId);
                if (resolved.stateName !== undefined)
                    body.stateName = resolved.stateName;
                if (resolved.cityName !== undefined)
                    body.cityName = resolved.cityName;
                if (resolved.locationDisplay !== undefined)
                    body.locationDisplay = resolved.locationDisplay;
            }
        }
        const baseSlug = (0, slugify_1.slugify)(name);
        const slug = await (0, slugify_1.ensureUniqueSlug)((s) => College_1.default.findOne({ slug: s }).then((doc) => doc), baseSlug);
        const college = new College_1.default({
            ...body,
            slug,
            createdBy: req.user?.id,
        });
        await college.save();
        res.status(201).json({ success: true, data: college });
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            const message = Object.values(error.errors).map((e) => e.message).join('; ');
            return res.status(400).json({ success: false, error: message });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.createCollege = createCollege;
const getCollegeById = async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        const college = await College_1.default.findById(id).lean();
        if (!college) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        res.json({ success: true, data: college });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.getCollegeById = getCollegeById;
const adminListColleges = async (req, res) => {
    try {
        const { category, stateId, cityId, page = '1', limit = '10' } = req.query;
        const pageNum = Math.max(1, parseInt(String(page), 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
        const skip = (pageNum - 1) * limitNum;
        const filter = {};
        if (category)
            filter.category = category;
        if (stateId)
            filter.stateId = new mongoose_1.default.Types.ObjectId(String(stateId));
        if (cityId)
            filter.cityId = new mongoose_1.default.Types.ObjectId(String(cityId));
        const [colleges, total] = await Promise.all([
            College_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
            College_1.default.countDocuments(filter),
        ]);
        const totalPages = Math.ceil(total / limitNum);
        res.json({
            success: true,
            data: {
                colleges,
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
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.adminListColleges = adminListColleges;
const updateCollege = async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        const raw = { ...req.body, updatedBy: req.user?.id };
        delete raw.slug;
        const updates = sanitizeCollegeBody(raw);
        const stateId = updates.stateId;
        const cityId = updates.cityId;
        if ((stateId || cityId) && (updates.stateName === undefined || updates.cityName === undefined || updates.locationDisplay === undefined)) {
            const resolved = await resolveLocationFromIds(stateId, cityId);
            if (resolved.stateName !== undefined)
                updates.stateName = resolved.stateName;
            if (resolved.cityName !== undefined)
                updates.cityName = resolved.cityName;
            if (resolved.locationDisplay !== undefined)
                updates.locationDisplay = resolved.locationDisplay;
        }
        const college = await College_1.default.findByIdAndUpdate(id, updates, { new: true });
        if (!college) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        res.json({ success: true, data: college });
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            const message = Object.values(error.errors).map((e) => e.message).join('; ');
            return res.status(400).json({ success: false, error: message });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.updateCollege = updateCollege;
const updateCollegeStatus = async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        const { isActive } = req.body;
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ success: false, error: 'isActive must be true or false' });
        }
        const college = await College_1.default.findByIdAndUpdate(id, { isActive, updatedBy: req.user?.id }, { new: true });
        if (!college) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        res.json({ success: true, data: college, message: college.isActive ? 'College activated' : 'College deactivated' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.updateCollegeStatus = updateCollegeStatus;
const deleteCollege = async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        const college = await College_1.default.findByIdAndDelete(id);
        if (!college) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        res.json({ success: true, message: 'College deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.deleteCollege = deleteCollege;
//# sourceMappingURL=collegeController.js.map