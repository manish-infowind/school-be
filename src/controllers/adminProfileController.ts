import { Request, Response } from 'express';
import User from '../models/User';
import busboy from 'busboy';
import { uploadToS3 } from '../utils/s3Service';

export const getProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, phone } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, {
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const changePassword = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const uploadAvatar = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const bb = busboy({ headers: req.headers });
        let avatarUrl = '';

        bb.on('file', async (name, file, info) => {
            const { filename, mimeType } = info;
            try {
                avatarUrl = await uploadToS3(file, filename, mimeType);

                await User.findByIdAndUpdate(userId, { avatar: avatarUrl });

                res.json({
                    success: true,
                    data: {
                        avatarUrl
                    },
                    message: 'Avatar uploaded successfully'
                });
            } catch (err: any) {
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error uploading to S3',
                        error: err.message
                    });
                }
            }
        });

        bb.on('error', (err: any) => {
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error parsing file',
                    error: err.message
                });
            }
        });

        req.pipe(bb);
    } catch (error: any) {
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
};
