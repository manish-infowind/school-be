"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitCounsellingEnquiry = void 0;
const CounsellingEnquiry_1 = __importDefault(require("../models/CounsellingEnquiry"));
const submitCounsellingEnquiry = async (req, res) => {
    try {
        const { name, email, phone, courseInterest, currentStatus, message, collegeId, source } = req.body;
        if (!name || !email || !phone) {
            return res.status(400).json({ success: false, error: 'name, email and phone are required' });
        }
        const enquiry = new CounsellingEnquiry_1.default({
            name,
            email,
            phone,
            courseInterest: courseInterest || undefined,
            currentStatus: currentStatus || undefined,
            message: message || undefined,
            collegeId: collegeId || undefined,
            status: 'new',
            source: source || 'cta',
        });
        await enquiry.save();
        res.status(201).json({ success: true, message: 'Enquiry submitted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error submitting enquiry' });
    }
};
exports.submitCounsellingEnquiry = submitCounsellingEnquiry;
//# sourceMappingURL=counsellingEnquiryController.js.map