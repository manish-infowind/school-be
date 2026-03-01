import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
    name: string;
    startDate: Date;
    endDate: Date;
    shortDescription?: string;
    longDescription?: string;
    imageUrl?: string;
    venue?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema: Schema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        shortDescription: { type: String, trim: true },
        longDescription: { type: String, trim: true },
        imageUrl: { type: String, trim: true },
        venue: { type: String, trim: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ isActive: 1 });

export default mongoose.model<IEvent>('Event', EventSchema);
