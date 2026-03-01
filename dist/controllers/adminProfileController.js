"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const busboy_1 = __importDefault(require("busboy"));
const s3Service_1 = require("../utils/s3Service");
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User_1.default.findById(userId).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }
        res.json({
            success: true,
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar
            }
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
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, phone } = req.body;
        const updatedUser = await User_1.default.findByIdAndUpdate(userId, {
            firstName,
            lastName,
            phone
        }, { new: true }).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }
        res.json({
            success: true,
            data: {
                id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                phone: updatedUser.phone,
                avatar: updatedUser.avatar
            },
            message: 'Profile updated successfully'
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
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect current password'
            });
        }
        user.password = newPassword;
        await user.save();
        res.json({
            success: true,
            message: 'Password changed successfully'
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
exports.changePassword = changePassword;
const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        const bb = (0, busboy_1.default)({ headers: req.headers });
        let avatarUrl = '';
        bb.on('file', async (name, file, info) => {
            const { filename, mimeType } = info;
            try {
                avatarUrl = await (0, s3Service_1.uploadToS3)(file, filename, mimeType);
                await User_1.default.findByIdAndUpdate(userId, { avatar: avatarUrl });
                res.json({
                    success: true,
                    data: {
                        avatarUrl
                    },
                    message: 'Avatar uploaded successfully'
                });
            }
            catch (err) {
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error uploading to S3',
                        error: err.message
                    });
                }
            }
        });
        bb.on('error', (err) => {
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error parsing file',
                    error: err.message
                });
            }
        });
        req.pipe(bb);
    }
    catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
};
exports.uploadAvatar = uploadAvatar;
//# sourceMappingURL=adminProfileController.js.map