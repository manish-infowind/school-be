import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
    stateId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    isActive: boolean;
    sortOrder?: number;
    createdAt: Date;
    updatedAt: Date;
}

const CitySchema: Schema = new Schema(
    {
        stateId: { type: Schema.Types.ObjectId, ref: 'State', required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number },
    },
    { timestamps: true }
);

CitySchema.index({ stateId: 1, slug: 1 }, { unique: true });
CitySchema.index({ stateId: 1 });
CitySchema.index({ isActive: 1 });

export default mongoose.model<ICity>('City', CitySchema);
