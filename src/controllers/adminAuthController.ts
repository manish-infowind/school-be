import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret_key_456';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
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

        const accessToken = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            REFRESH_SECRET,
            { expiresIn: '7d' }
        );

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'refreshToken required' });
        }
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }
        const accessToken = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ success: true, data: { accessToken } });
    } catch (error: any) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};

export const logout = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

        await user.save();

        res.json({
            success: true,
            message: 'Password reset link sent to email (Dev mode: check console or use this token)',
            data: { resetToken } // Normally not sent in response, but for dev ease
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
