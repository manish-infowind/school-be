import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Enquiry from '../models/Enquiry';
import Course from '../models/Course';
import { sendEnquiryNotificationToAdmin } from '../services/emailService';

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;
function isValidObjectId(id: string): boolean {
    return typeof id === 'string' && OBJECT_ID_REGEX.test(id.trim());
}

/**
 * Student/customer submits an enquiry.
 * Mandatory: mobile. Optional: name, email, description, courseId.
 * On success, triggers email to admin (if SMTP configured).
 */
export const createEnquiry = async (req: Request, res: Response) => {
    try {
        const { mobile, name, email, description, courseId } = req.body;

        const mobileStr = typeof mobile === 'string' ? mobile.trim() : '';
        if (!mobileStr) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: [{ field: 'mobile', message: 'Mobile number is required' }],
            });
        }

        if (courseId && !isValidObjectId(String(courseId))) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: [{ field: 'courseId', message: 'Invalid courseId format (24-char hex)' }],
            });
        }

        const enquiry = new Enquiry({
            mobile: mobileStr,
            name: typeof name === 'string' ? name.trim() || undefined : undefined,
            email: typeof email === 'string' ? email.trim() || undefined : undefined,
            description: typeof description === 'string' ? description.trim() || undefined : undefined,
            courseId: courseId && isValidObjectId(String(courseId)) ? new mongoose.Types.ObjectId(String(courseId)) : undefined,
        });
        await enquiry.save();

        let courseName: string | undefined;
        if (enquiry.courseId) {
            const course = await Course.findById(enquiry.courseId).select('name').lean();
            if (course && typeof (course as { name?: string }).name === 'string') {
                courseName = (course as { name: string }).name;
            }
        }

        sendEnquiryNotificationToAdmin({
            mobile: enquiry.mobile,
            name: enquiry.name,
            email: enquiry.email,
            description: enquiry.description,
            courseName,
        }).catch(() => {});

        res.status(201).json({
            success: true,
            data: {
                id: enquiry._id,
                mobile: enquiry.mobile,
                name: enquiry.name ?? null,
                email: enquiry.email ?? null,
                description: enquiry.description ?? null,
                courseId: enquiry.courseId ? String(enquiry.courseId) : null,
                status: enquiry.status,
                createdAt: enquiry.createdAt,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
