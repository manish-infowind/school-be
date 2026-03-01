"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEE_PERIODS = exports.COLLEGE_CATEGORIES = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.COLLEGE_CATEGORIES = [
    'Engineering',
    'MBA',
    'Medical',
    'Law',
    'Design',
    'Commerce',
    'Pharmacy',
    'Architecture',
    'Data Science',
    'MCA',
    'Private',
    'Autonomous',
    'Government',
    'Deemed',
    'Aided',
    'Other',
];
exports.FEE_PERIODS = ['year', 'semester'];
const CollegeSchema = new mongoose_1.Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    shortName: { type: String },
    countryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Country', required: true },
    stateId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'State', required: true },
    cityId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'City', required: true },
    stateName: { type: String, required: true },
    cityName: { type: String, required: true },
    address: { type: String },
    pinCode: { type: String },
    locationDisplay: { type: String, required: true },
    category: { type: String, enum: exports.COLLEGE_CATEGORIES, required: true },
    courses: [{ type: String }],
    courseFees: [{
            courseName: { type: String, required: true },
            fee: { type: String },
            feeAmount: { type: Number },
            feePeriod: { type: String, enum: exports.FEE_PERIODS },
        }],
    badge: { type: String },
    fee: { type: String },
    feeAmount: { type: Number },
    feePeriod: { type: String, enum: exports.FEE_PERIODS },
    rating: { type: Number },
    nirfRank: { type: Number },
    placementRate: { type: Number },
    avgPackage: { type: String },
    description: { type: String },
    highlights: [{ type: String }],
    eligibility: { type: String },
    facilities: [{ type: String }],
    website: { type: String },
    phone: { type: String },
    email: { type: String },
    logoUrl: { type: String },
    coverImageUrl: { type: String },
    galleryUrls: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
CollegeSchema.index({ stateId: 1, cityId: 1, category: 1, isActive: 1 });
CollegeSchema.index({ stateName: 1, cityName: 1 });
CollegeSchema.index({ createdAt: -1 });
CollegeSchema.index({ name: 'text', locationDisplay: 'text', courses: 'text' }, { name: 'college_text_search' });
exports.default = mongoose_1.default.model('College', CollegeSchema);
//# sourceMappingURL=College.js.map