import mongoose, { Schema, Document } from 'mongoose';

export interface ICounsellingEnquiry extends Document {
    name: string;
    email: string;
    phone: string;
    courseInterest?: string;
    currentStatus?: string;
    message?: string;
    collegeId?: mongoose.Types.ObjectId;
    status: 'new' | 'contacted' | 'closed';
    source: 'cta' | 'college_page';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CounsellingEnquirySchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        courseInterest: { type: String },
        currentStatus: { type: String },
        message: { type: String },
        collegeId: { type: Schema.Types.ObjectId, ref: 'College' },
        status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
        source: { type: String, enum: ['cta', 'college_page'], default: 'cta' },
        notes: { type: String },
    },
    { timestamps: true, collection: 'counselling_enquiries' }
);

CounsellingEnquirySchema.index({ createdAt: -1 });
CounsellingEnquirySchema.index({ status: 1 });
CounsellingEnquirySchema.index({ email: 1 });
CounsellingEnquirySchema.index({ phone: 1 });

export default mongoose.model<ICounsellingEnquiry>('CounsellingEnquiry', CounsellingEnquirySchema);
