"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAdmin = exports.resetPassword = exports.forgotPassword = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            user: {
                id: user._id,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();
        // Normally you would send an email here.
        // For development, we return the token.
        res.json({
            message: 'Password reset token generated (Dev Mode)',
            resetToken
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: 'Password reset successful' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.resetPassword = resetPassword;
const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const admin = new User_1.default({
            name,
            email,
            password,
            phone,
            role: 'admin'
        });
        await admin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.registerAdmin = registerAdmin;
//# sourceMappingURL=authController.js.map