import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone?: string;
    avatar?: string;
    role: 'admin' | 'user';
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    refreshToken?: string;
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['admin', 'user'], default: 'admin' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    refreshToken: { type: String },
    createdAt: { type: Date, default: Date.now },
}, { collection: 'admin' });

// Hash password before saving
UserSchema.pre('save', async function (this: IUser) {
    if (!this.isModified('password')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password!, salt);
    } catch (err: any) {
        throw err;
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password!);
};

export default mongoose.model<IUser>('User', UserSchema);
