"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEnquiryNotificationToAdmin = sendEnquiryNotificationToAdmin;
/**
 * Simple email service for notifying admin when a new enquiry is submitted.
 * Configure SMTP in .env (see .env.example). If not configured, logs and skips sending.
 */
const nodemailer_1 = __importDefault(require("nodemailer"));
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(String(process.env.SMTP_PORT), 10) || 587;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'noreply@example.com';
function isEmailConfigured() {
    return !!(ADMIN_EMAIL && SMTP_HOST && SMTP_USER && SMTP_PASS);
}
async function sendEnquiryNotificationToAdmin(payload) {
    if (!isEmailConfigured()) {
        console.warn('[Email] SMTP or ADMIN_EMAIL not configured; skipping enquiry notification.');
        return;
    }
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_SECURE,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
        const lines = [
            'New enquiry received.',
            '',
            `Mobile: ${payload.mobile}`,
            payload.name ? `Name: ${payload.name}` : null,
            payload.email ? `Email: ${payload.email}` : null,
            payload.courseName ? `Course: ${payload.courseName}` : null,
            payload.description ? `Message: ${payload.description}` : null,
        ].filter(Boolean);
        const text = lines.join('\n');
        await transporter.sendMail({
            from: SMTP_FROM,
            to: ADMIN_EMAIL,
            subject: 'New Enquiry Received',
            text,
        });
    }
    catch (err) {
        console.error('[Email] Failed to send enquiry notification:', err);
    }
}
//# sourceMappingURL=emailService.js.map