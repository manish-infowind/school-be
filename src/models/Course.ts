import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
    name: string;
    slug: string;
    isActive: boolean;
    sortOrder?: number;
    createdAt: Date;
    updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number },
    },
    { timestamps: true }
);

CourseSchema.index({ isActive: 1 });
CourseSchema.index({ sortOrder: 1, name: 1 });

export default mongoose.model<ICourse>('Course', CourseSchema);
