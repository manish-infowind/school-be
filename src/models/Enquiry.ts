import mongoose, { Schema, Document } from 'mongoose';

export interface IEnquiry extends Document {
    studentName: string;
    studentEmail: string;
    phone: string;
    message: string;
    collegeId: mongoose.Types.ObjectId;
    status: 'pending' | 'reviewed' | 'resolved';
    createdAt: Date;
}

const EnquirySchema: Schema = new Schema({
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
