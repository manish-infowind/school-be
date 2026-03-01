/**
 * Simple email service for notifying admin when a new enquiry is submitted.
 * Configure SMTP in .env (see .env.example). If not configured, logs and skips sending.
 */
import nodemailer from 'nodemailer';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(String(process.env.SMTP_PORT), 10) || 587;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'noreply@example.com';

function isEmailConfigured(): boolean {
    return !!(ADMIN_EMAIL && SMTP_HOST && SMTP_USER && SMTP_PASS);
}

export interface EnquiryEmailPayload {
    mobile: string;
    name?: string;
    email?: string;
    description?: string;
    courseName?: string;
}

export async function sendEnquiryNotificationToAdmin(payload: EnquiryEmailPayload): Promise<void> {
    if (!isEmailConfigured()) {
        console.warn('[Email] SMTP or ADMIN_EMAIL not configured; skipping enquiry notification.');
        return;
    }
    try {
        const transporter = nodemailer.createTransport({
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
    } catch (err) {
        console.error('[Email] Failed to send enquiry notification:', err);
    }
}
