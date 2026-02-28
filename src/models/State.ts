import mongoose, { Schema, Document } from 'mongoose';

export interface IState extends Document {
    countryId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    isActive: boolean;
    sortOrder?: number;
    createdAt: Date;
    updatedAt: Date;
}

const StateSchema: Schema = new Schema(
    {
        countryId: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number },
    },
    { timestamps: true }
);

StateSchema.index({ countryId: 1 });
StateSchema.index({ isActive: 1 });

export default mongoose.model<IState>('State', StateSchema);
