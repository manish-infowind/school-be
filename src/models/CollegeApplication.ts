import mongoose, { Schema, Document } from 'mongoose';

export interface ICollegeApplication extends Document {
    collegeId: mongoose.Types.ObjectId;
    email: string;
    phone: string;
    name?: string;
    status: 'submitted' | 'processed';
    createdAt: Date;
    updatedAt: Date;
}

const CollegeApplicationSchema: Schema = new Schema(
    {
        collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        name: { type: String },
        status: { type: String, enum: ['submitted', 'processed'], default: 'submitted' },
    },
    { timestamps: true, collection: 'college_applications' }
);

CollegeApplicationSchema.index({ collegeId: 1 });
CollegeApplicationSchema.index({ createdAt: -1 });

export default mongoose.model<ICollegeApplication>('CollegeApplication', CollegeApplicationSchema);
