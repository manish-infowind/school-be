"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardCounts = void 0;
const College_1 = __importDefault(require("../models/College"));
const Enquiry_1 = __importDefault(require("../models/Enquiry"));
const CollegeApplication_1 = __importDefault(require("../models/CollegeApplication"));
const getDashboardCounts = async (_req, res) => {
    try {
        const [collegesTotal, collegesActive, enquiriesPending, enquiriesTotal, applicationsTotal] = await Promise.all([
            College_1.default.countDocuments(),
            College_1.default.countDocuments({ isActive: true }),
            Enquiry_1.default.countDocuments({ status: 'pending' }),
            Enquiry_1.default.countDocuments(),
            CollegeApplication_1.default.countDocuments(),
        ]);
        res.json({
            success: true,
            data: {
                colleges: { total: collegesTotal, active: collegesActive },
                enquiries: { total: enquiriesTotal, pending: enquiriesPending },
                applications: { total: applicationsTotal },
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching dashboard' });
    }
};
exports.getDashboardCounts = getDashboardCounts;
//# sourceMappingURL=adminDashboardController.js.map