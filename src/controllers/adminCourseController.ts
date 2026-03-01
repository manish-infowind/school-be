import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course';
import { slugify, ensureUniqueSlug } from '../utils/slugify';

export const listCourses = async (req: Request, res: Response) => {
    try {
        const courses = await Course.find({})
            .sort({ sortOrder: 1, name: 1 })
            .lean();
        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching courses' });
    }
};

export const createCourse = async (req: Request, res: Response) => {
    try {
        const { name, isActive, sortOrder } = req.body;
        const nameStr = typeof name === 'string' ? name.trim() : '';
        if (!nameStr) {
            return res.status(400).json({ success: false, error: 'name is required' });
        }
        const baseSlug = slugify(nameStr);
        const slug = await ensureUniqueSlug(
            (s) => Course.findOne({ slug: s }).then((doc) => doc),
            baseSlug
        );
        const course = new Course({
            name: nameStr,
            slug,
            isActive: isActive !== false,
            sortOrder: typeof sortOrder === 'number' ? sortOrder : undefined,
        });
        await course.save();
        res.status(201).json({ success: true, data: course });
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            const message = Object.values(error.errors).map((e) => e.message).join('; ');
            return res.status(400).json({ success: false, error: message });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const getCourseById = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Course not found', code: 'COURSE_NOT_FOUND' });
        }
        const course = await Course.findById(id).lean();
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found', code: 'COURSE_NOT_FOUND' });
        }
        res.json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const updateCourse = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Course not found', code: 'COURSE_NOT_FOUND' });
        }
        const updates = { ...req.body };
        delete (updates as Record<string, unknown>).slug;
        if (typeof (updates as { name?: string }).name === 'string') {
            (updates as { name: string }).name = (updates as { name: string }).name.trim();
        }
        const course = await Course.findByIdAndUpdate(id, updates, { new: true });
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found', code: 'COURSE_NOT_FOUND' });
        }
        res.json({ success: true, data: course });
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            const message = Object.values(error.errors).map((e) => e.message).join('; ');
            return res.status(400).json({ success: false, error: message });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id ?? '');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: 'Course not found', code: 'COURSE_NOT_FOUND' });
        }
        const course = await Course.findByIdAndDelete(id);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found', code: 'COURSE_NOT_FOUND' });
        }
        res.json({ success: true, message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
