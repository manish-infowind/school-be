import { Request, Response } from 'express';
import College from '../models/College';
import Course from '../models/Course';
import Country from '../models/Country';
import State from '../models/State';
import City from '../models/City';
import { slugify, ensureUniqueSlug } from '../utils/slugify';
import mongoose from 'mongoose';
import { COLLEGE_CATEGORIES } from '../models/College';

const SORT_OPTIONS = ['name_asc', 'name_desc', 'fee_asc', 'fee_desc', 'rating_desc', 'nirf_asc', 'newest', 'relevance'] as const;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

function isValidObjectId(id: string): boolean {
    return typeof id === 'string' && OBJECT_ID_REGEX.test(id.trim());
}

function parsePage(val: unknown): number {
    const n = parseInt(String(val ?? 1), 10);
    return Number.isNaN(n) || n < 1 ? 1 : n;
}

function parseLimit(val: unknown): number {
    const n = parseInt(String(val ?? DEFAULT_LIMIT), 10);
    if (Number.isNaN(n) || n < 1) return DEFAULT_LIMIT;
    return Math.min(n, MAX_LIMIT);
}

function parseSort(val: unknown): (typeof SORT_OPTIONS)[number] {
    const s = String(val ?? 'name_asc').trim();
    return SORT_OPTIONS.includes(s as (typeof SORT_OPTIONS)[number]) ? (s as (typeof SORT_OPTIONS)[number]) : 'name_asc';
}

function buildSearchFilter(searchStr: string): Record<string, unknown> {
    const tokens = searchStr.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return {};
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

function getSortStage(sort: (typeof SORT_OPTIONS)[number], hasSearch: boolean): Record<string, 1 | -1> {
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

type CollegeDoc = {
    _id: mongoose.Types.ObjectId;
    slug: string;
    name: string;
    shortName?: string;
    stateId?: mongoose.Types.ObjectId;
    cityId?: mongoose.Types.ObjectId;
    stateName: string;
    cityName: string;
    locationDisplay: string;
    category: string;
    courses: string[];
    fee?: string;
    badge?: string;
    description?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    isVerified: boolean;
    [key: string]: unknown;
};

function toListItem(doc: CollegeDoc): Record<string, unknown> {
    const location = doc.locationDisplay || `${doc.cityName || ''}, ${doc.stateName || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || null;
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
        fee: doc.fee ?? '',
        badge: doc.badge ?? '',
        description: doc.description ?? null,
        logoUrl: doc.logoUrl ?? null,
        coverImageUrl: doc.coverImageUrl ?? null,
        isVerified: !!doc.isVerified,
    };
}

function toDetailPayload(doc: Record<string, unknown>): Record<string, unknown> {
    const location = (doc.locationDisplay as string) || `${(doc.cityName as string) || ''}, ${(doc.stateName as string) || ''}`.replace(/^,\s*|,\s*$/g, '').trim();
    const rawCourseFees = Array.isArray(doc.courseFees) ? doc.courseFees : [];
    const courseFees = rawCourseFees.map((cf: Record<string, unknown>) => ({
        course: cf.courseName ?? cf.course ?? '',
        fee: cf.fee ?? '',
    })).filter((cf: { course: string }) => cf.course);
    return {
        id: doc.slug,
        slug: doc.slug,
        name: doc.name,
        shortName: doc.shortName ?? null,
        location: location || `${(doc.cityName as string) || ''}, ${(doc.stateName as string) || ''}`.trim(),
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

export const listColleges = async (req: Request, res: Response) => {
    try {
        const { category, state, stateId, city, cityId, courseId, search, sort, verified, page, limit } = req.query;

        const validationErrors: { field: string; message: string }[] = [];
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

        const filter: Record<string, unknown> = { isActive: true };

        if (category && String(category).trim() && String(category).trim() !== 'All') {
            const cat = String(category).trim();
            if (COLLEGE_CATEGORIES.includes(cat as (typeof COLLEGE_CATEGORIES)[number])) {
                filter.category = cat;
            }
        }

        if (stateId && isValidObjectId(String(stateId))) {
            filter.stateId = new mongoose.Types.ObjectId(String(stateId));
        } else if (state && String(state).trim()) {
            filter.stateName = new RegExp(String(state).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        }

        if (cityId && isValidObjectId(String(cityId))) {
            filter.cityId = new mongoose.Types.ObjectId(String(cityId));
        } else if (city && String(city).trim()) {
            filter.cityName = new RegExp(String(city).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        }

        if (courseId && isValidObjectId(String(courseId))) {
            const courseDoc = await Course.findById(courseId).select('name').lean();
            if (courseDoc && typeof (courseDoc as { name?: string }).name === 'string') {
                filter.courses = (courseDoc as { name: string }).name;
            }
        }

        if (verified === 'true' || verified === true) filter.isVerified = true;
        else if (verified === 'false' || verified === false) filter.isVerified = false;

        const searchFilter = hasSearch ? buildSearchFilter(searchStr) : {};
        const fullFilter = Object.keys(searchFilter).length > 0 ? { $and: [filter, searchFilter] } : filter;

        const sortStage = getSortStage(sortOption, hasSearch);
        const query = College.find(fullFilter);

        const [colleges, total] = await Promise.all([
            query.clone().sort(sortStage).skip(skip).limit(limitNum).lean(),
            query.clone().countDocuments(),
        ]);

        const totalPages = Math.ceil(total / limitNum);
        const listItems = (colleges as CollegeDoc[]).map(toListItem);

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
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const getCollegeBySlug = async (req: Request, res: Response) => {
    try {
        const slug = String(req.params.slug ?? '').trim();
        if (!slug) {
            return res.status(404).json({
                success: false,
                error: 'College not found',
                code: 'COLLEGE_NOT_FOUND',
            });
        }
        const college = await College.findOne({ slug, isActive: true }).lean();
        if (!college) {
            return res.status(404).json({
                success: false,
                error: 'College not found',
                code: 'COLLEGE_NOT_FOUND',
            });
        }
        res.json({ success: true, data: toDetailPayload(college as Record<string, unknown>) });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// ----- Admin (used by admin routes with auth) -----

/** Resolve stateName, cityName, locationDisplay from stateId and cityId (for admin create/update). */
async function resolveLocationFromIds(
    stateId: mongoose.Types.ObjectId | string | undefined,
    cityId: mongoose.Types.ObjectId | string | undefined
): Promise<{ stateName?: string; cityName?: string; locationDisplay?: string }> {
    if (!stateId && !cityId) return {};
    const sid = stateId ? new mongoose.Types.ObjectId(String(stateId)) : null;
    const cid = cityId ? new mongoose.Types.ObjectId(String(cityId)) : null;
    const [state, city] = await Promise.all([
        sid ? State.findById(sid).select('name').lean() : Promise.resolve(null),
        cid ? City.findById(cid).select('name').lean() : Promise.resolve(null),
    ]);
    const stateName = state && 'name' in state ? state.name : undefined;
    const cityName = city && 'name' in city ? city.name : undefined;
    const locationDisplay =
        cityName !== undefined && stateName !== undefined
            ? `${cityName}, ${stateName}`
            : stateName ?? cityName ?? undefined;
    return { stateName, cityName, locationDisplay };
}

function normalizeArrayField(val: unknown): string[] {
    if (Array.isArray(val)) return val.filter((v) => typeof v === 'string');
    if (typeof val === 'string') return val.trim() ? [val] : [];
    return [];
}

interface CourseFeeInput {
    courseName?: string;
    fee?: string;
    feeAmount?: number;
    feePeriod?: string;
}

function normalizeCourseFees(val: unknown): { courseName: string; fee?: string; feeAmount?: number; feePeriod?: string }[] {
    if (!Array.isArray(val)) return [];
    return val
        .filter((v): v is CourseFeeInput => v != null && typeof v === 'object')
        .map((v) => ({
            courseName: typeof v.courseName === 'string' ? v.courseName.trim() : '',
            fee: typeof v.fee === 'string' ? v.fee : undefined,
            feeAmount: typeof v.feeAmount === 'number' && !Number.isNaN(v.feeAmount) ? v.feeAmount : undefined,
            feePeriod: v.feePeriod === 'year' || v.feePeriod === 'semester' ? v.feePeriod : undefined,
        }))
        .filter((c) => c.courseName.length > 0);
}

function sanitizeCollegeBody(body: Record<string, unknown>): Record<string, unknown> {
    const out = { ...body };
    if (out.courseFees !== undefined) {
        out.courseFees = normalizeCourseFees(out.courseFees);
        out.courses = (out.courseFees as { courseName: string }[]).map((c) => c.courseName);
    } else if (out.courses !== undefined) {
        out.courses = normalizeArrayField(out.courses);
    }
    if (out.highlights !== undefined) out.highlights = normalizeArrayField(out.highlights);
    if (out.facilities !== undefined) out.facilities = normalizeArrayField(out.facilities);
    if (out.galleryUrls !== undefined) out.galleryUrls = normalizeArrayField(out.galleryUrls);
    return out;
}

export const createCollege = async (req: Request, res: Response) => {
    try {
        const raw = req.body as Record<string, unknown>;
        const body = sanitizeCollegeBody(raw);
        const name = String(body.name || '');
        if (!name) {
            return res.status(400).json({ success: false, error: 'name is required' });
        }
        if (!body.countryId) {
            const india = await Country.findOne({ code: 'IN' }).select('_id').lean();
            if (india) body.countryId = india._id.toString();
            else return res.status(400).json({ success: false, error: 'countryId is required' });
        }
        const stateId = body.stateId;
        const cityId = body.cityId;
        if (stateId || cityId) {
            const needLocation =
                body.stateName === undefined || body.cityName === undefined || body.locationDisplay === undefined;
            if (needLocation) {
                const resolved = await resolveLocationFromIds(
                    stateId as string | undefined,
                    cityId as string | undefined
                );
                if (resolved.stateName !== undefined) body.stateName = resolved.stateName;
                if (resolved.cityName !== undefined) body.cityName = resolved.cityName;
                if (resolved.locationDisplay !== undefined) body.locationDisplay = resolved.locationDisplay;
            }
        }
        const baseSlug = slugify(name);
        const slug = await ensureUniqueSlug(
            (s) => College.findOne({ slug: s }).then((doc) => doc),
            baseSlug
        );
        const college = new College({
            ...body,
            slug,
            createdBy: (req as Request & { user?: { id?: string } }).user?.id,
        });
        await college.save();
        res.status(201).json({ success: true, data: college });
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            const message = Object.values(error.errors).map((e) => e.message).join('; ');
            return res.status(400).json({ success: false, error: message });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const getCollegeById = async (req: Request, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        const college = await College.findById(req.params.id).lean();
        if (!college) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        res.json({ success: true, data: college });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const adminListColleges = async (req: Request, res: Response) => {
    try {
        const { category, stateId, cityId, page = '1', limit = '10' } = req.query;
        const pageNum = Math.max(1, parseInt(String(page), 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
        const skip = (pageNum - 1) * limitNum;

        const filter: Record<string, unknown> = {};
        if (category) filter.category = category;
        if (stateId) filter.stateId = new mongoose.Types.ObjectId(String(stateId));
        if (cityId) filter.cityId = new mongoose.Types.ObjectId(String(cityId));

        const [colleges, total] = await Promise.all([
            College.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
            College.countDocuments(filter),
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
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const updateCollege = async (req: Request, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        const raw = { ...req.body, updatedBy: (req as Request & { user?: { id?: string } }).user?.id };
        delete (raw as Record<string, unknown>).slug;
        const updates = sanitizeCollegeBody(raw as Record<string, unknown>);
        const stateId = updates.stateId;
        const cityId = updates.cityId;
        if ((stateId || cityId) && (updates.stateName === undefined || updates.cityName === undefined || updates.locationDisplay === undefined)) {
            const resolved = await resolveLocationFromIds(
                stateId as string | undefined,
                cityId as string | undefined
            );
            if (resolved.stateName !== undefined) updates.stateName = resolved.stateName;
            if (resolved.cityName !== undefined) updates.cityName = resolved.cityName;
            if (resolved.locationDisplay !== undefined) updates.locationDisplay = resolved.locationDisplay;
        }
        const college = await College.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!college) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        res.json({ success: true, data: college });
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            const message = Object.values(error.errors).map((e) => e.message).join('; ');
            return res.status(400).json({ success: false, error: message });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const updateCollegeStatus = async (req: Request, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        const { isActive } = req.body;
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ success: false, error: 'isActive must be true or false' });
        }
        const college = await College.findByIdAndUpdate(
            req.params.id,
            { isActive, updatedBy: (req as Request & { user?: { id?: string } }).user?.id },
            { new: true }
        );
        if (!college) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        res.json({ success: true, data: college, message: college.isActive ? 'College activated' : 'College deactivated' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const deleteCollege = async (req: Request, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        const college = await College.findByIdAndDelete(req.params.id);
        if (!college) {
            return res.status(404).json({ success: false, error: 'College not found', code: 'COLLEGE_NOT_FOUND' });
        }
        res.json({ success: true, message: 'College deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
