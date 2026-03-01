"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.getCourseById = exports.createCourse = exports.listCourses = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Course_1 = __importDefault(require("../models/Course"));
const slugify_1 = require("../utils/slugify");
const listCourses = async (req, res) => {
    try {
        const courses = await Course_1.default.find({})
            .sort({ sortOrder: 1, name: 1 })
            .lean();
        res.json({ success: true, data: courses });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching courses' });
    }
};
exports.listCourses = listCourses;
const createCourse = async (req, res) => {
    try {
        const { name, isActive, sortOrder } = req.body;
        const nameStr = typeof name === 'string' ? name.trim() : '';
        if (!nameStr) {
            return res.status(400).json({ success: false, error: 'name is required' });
        }
        const baseSlug = (0, slugify_1.slugify)(nameStr);
        const slug = await (0, slugify_1.ensureUniqueSlug)((s) => Course_1.default.findOne({ slug: s }).then((doc) => doc), baseSlug);
        const course = new Course_1.default({
            name: nameStr,
            slug,
            isActive: isActive !== false,
            sortOrder: typeof sortOrder === 'number' ? sortOrder : undefined,
        });
        await course.save();
        res.status(201).json({ success: true, data: course });
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            const message = Object.values(error.errors).map((e) => e.message).join('; ');
            return res.status(400).json({ success: false, error: message });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.createCourse = createCourse;
const getCourseById = async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Course not found', code: 'COURSE_NOT_FOUND' });
        }
        const course = await Course_1.default.findById(id).lean();
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found', code: 'COURSE_NOT_FOUND' });
        }
        res.json({ success: true, data: course });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.getCourseById = getCourseById;
const updateCourse = async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Course not found', code: 'COURSE_NOT_FOUND' });
        }
        const updates = { ...req.body };
        delete updates.slug;
        if (typeof updates.name === 'string') {
            updates.name = updates.name.trim();
        }
        const course = await Course_1.default.findByIdAndUpdate(id, updates, { new: true });
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found', code: 'COURSE_NOT_FOUND' });
        }
        res.json({ success: true, data: course });
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            const message = Object.values(error.errors).map((e) => e.message).join('; ');
            return res.status(400).json({ success: false, error: message });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.updateCourse = updateCourse;
const deleteCourse = async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Course not found', code: 'COURSE_NOT_FOUND' });
        }
        const course = await Course_1.default.findByIdAndDelete(id);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found', code: 'COURSE_NOT_FOUND' });
        }
        res.json({ success: true, message: 'Course deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.deleteCourse = deleteCourse;
//# sourceMappingURL=adminCourseController.js.map