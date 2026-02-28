import mongoose, { Schema, Document } from 'mongoose';

export const COLLEGE_CATEGORIES = [
    'Engineering',
    'MBA',
    'Medical',
    'Law',
    'Design',
    'Commerce',
    'Pharmacy',
    'Architecture',
    'Data Science',
    'MCA',
    'Private',
    'Autonomous',
    'Government',
    'Deemed',
    'Aided',
    'Other',
] as const;
export type CollegeCategory = (typeof COLLEGE_CATEGORIES)[number];

export const FEE_PERIODS = ['year', 'semester'] as const;
export type FeePeriod = (typeof FEE_PERIODS)[number];

export interface ICourseFee {
    courseName: string;
    fee?: string;
    feeAmount?: number;
    feePeriod?: FeePeriod;
}

export interface ICollege extends Document {
    slug: string;
    name: string;
    shortName?: string;
    countryId: mongoose.Types.ObjectId;
    stateId: mongoose.Types.ObjectId;
    cityId: mongoose.Types.ObjectId;
    stateName: string;
    cityName: string;
    address?: string;
    pinCode?: string;
    locationDisplay: string;
    category: CollegeCategory;
    courses: string[];
    /** Per-course fees. If set, `courses` is synced from courseFees[].courseName for search/display. */
    courseFees?: ICourseFee[];
    badge?: string;
    fee?: string;
    feeAmount?: number;
    feePeriod?: FeePeriod;
    rating?: number;
    nirfRank?: number;
    placementRate?: number;
    avgPackage?: string;
    description?: string;
    highlights: string[];
    eligibility?: string;
    facilities: string[];
    website?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    galleryUrls: string[];
    isActive: boolean;
    isVerified: boolean;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CollegeSchema: Schema = new Schema(
    {
        slug: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        shortName: { type: String },
        countryId: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
        stateId: { type: Schema.Types.ObjectId, ref: 'State', required: true },
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        stateName: { type: String, required: true },
        cityName: { type: String, required: true },
        address: { type: String },
        pinCode: { type: String },
        locationDisplay: { type: String, required: true },
        category: { type: String, enum: COLLEGE_CATEGORIES, required: true },
        courses: [{ type: String }],
        courseFees: [{
            courseName: { type: String, required: true },
            fee: { type: String },
            feeAmount: { type: Number },
            feePeriod: { type: String, enum: FEE_PERIODS },
        }],
        badge: { type: String },
        fee: { type: String },
        feeAmount: { type: Number },
        feePeriod: { type: String, enum: FEE_PERIODS },
        rating: { type: Number },
        nirfRank: { type: Number },
        placementRate: { type: Number },
        avgPackage: { type: String },
        description: { type: String },
        highlights: [{ type: String }],
        eligibility: { type: String },
        facilities: [{ type: String }],
        website: { type: String },
        phone: { type: String },
        email: { type: String },
        logoUrl: { type: String },
        coverImageUrl: { type: String },
        galleryUrls: [{ type: String }],
        isActive: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: false },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

CollegeSchema.index({ stateId: 1, cityId: 1, category: 1, isActive: 1 });
CollegeSchema.index({ stateName: 1, cityName: 1 });
CollegeSchema.index({ createdAt: -1 });
CollegeSchema.index(
    { name: 'text', locationDisplay: 'text', courses: 'text' },
    { name: 'college_text_search' }
);

export default mongoose.model<ICollege>('College', CollegeSchema);
