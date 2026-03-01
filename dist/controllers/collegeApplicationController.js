"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitCollegeApplication = void 0;
const CollegeApplication_1 = __importDefault(require("../models/CollegeApplication"));
const submitCollegeApplication = async (req, res) => {
    try {
        const { collegeId, email, phone, name } = req.body;
        if (!collegeId || !email || !phone) {
            return res.status(400).json({ success: false, error: 'collegeId, email and phone are required' });
        }
        const application = new CollegeApplication_1.default({
            collegeId,
            email,
            phone,
            name: name || undefined,
            status: 'submitted',
        });
        await application.save();
        res.status(201).json({ success: true, message: 'Application submitted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error submitting application' });
    }
};
exports.submitCollegeApplication = submitCollegeApplication;
//# sourceMappingURL=collegeApplicationController.js.map