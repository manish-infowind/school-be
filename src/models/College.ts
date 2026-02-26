import mongoose, { Schema, Document } from 'mongoose';

export interface ICollege extends Document {
    name: string;
    location: string;
    description: string;
    courses: string[];
    contactEmail: string;
    createdAt: Date;
}

const CollegeSchema: Schema = new Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    courses: [{ type: String }],
    contactEmail: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICollege>('College', CollegeSchema);
