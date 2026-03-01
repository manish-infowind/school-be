import mongoose, { Schema, Document } from 'mongoose';

export const ENQUIRY_STATUSES = ['pending', 'reviewed', 'resolved'] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export interface IEnquiry extends Document {
    /** Mobile number – mandatory. */
    mobile: string;
    /** Student name – optional. */
    name?: string;
    /** Email – optional. */
    email?: string;
    /** Enquiry description/message – optional. */
    description?: string;
    /** Course for which enquiry is made – optional (use GET /api/courses for dropdown). */
    courseId?: mongoose.Types.ObjectId;
    status: EnquiryStatus;
    /** Admin-only notes. */
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const EnquirySchema: Schema = new Schema(
    {
        mobile: { type: String, required: true, trim: true },
        name: { type: String, trim: true },
        email: { type: String, trim: true },
        description: { type: String, trim: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
        status: { type: String, enum: ENQUIRY_STATUSES, default: 'pending' },
        notes: { type: String, trim: true },
    },
    { timestamps: true }
);

EnquirySchema.index({ createdAt: -1 });
EnquirySchema.index({ status: 1 });
EnquirySchema.index({ mobile: 1 });

export default mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
