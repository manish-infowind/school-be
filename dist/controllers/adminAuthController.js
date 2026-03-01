"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = exports.logout = exports.refresh = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret_key_456';
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '7d' });
        user.refreshToken = refreshToken;
        await user.save();
        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                tokens: {
                    accessToken,
                    refreshToken
                }
            },
            message: 'Login successful'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'refreshToken required' });
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
        const user = await User_1.default.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, data: { accessToken } });
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const userId = req.user.id;
        await User_1.default.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
exports.logout = logout;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();
        res.json({
            success: true,
            message: 'Password reset link sent to email (Dev mode: check console or use this token)',
            data: { resetToken } // Normally not sent in response, but for dev ease
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
exports.forgotPassword = forgotPassword;
//# sourceMappingURL=adminAuthController.js.map