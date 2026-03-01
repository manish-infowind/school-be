"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourses = exports.getCities = exports.getStates = exports.getCountries = void 0;
const Country_1 = __importDefault(require("../models/Country"));
const State_1 = __importDefault(require("../models/State"));
const City_1 = __importDefault(require("../models/City"));
const Course_1 = __importDefault(require("../models/Course"));
const getCountries = async (_req, res) => {
    try {
        const countries = await Country_1.default.find({ isActive: true })
            .select('_id name code')
            .sort({ name: 1 })
            .lean();
        res.json({ success: true, data: countries });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching countries' });
    }
};
exports.getCountries = getCountries;
const getStates = async (req, res) => {
    try {
        const { countryId } = req.query;
        const filter = { isActive: true };
        if (countryId)
            filter.countryId = countryId;
        const states = await State_1.default.find(filter)
            .select('_id name slug')
            .sort({ sortOrder: 1, name: 1 })
            .lean();
        res.json({ success: true, data: states });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching states' });
    }
};
exports.getStates = getStates;
const getCities = async (req, res) => {
    try {
        const { stateId } = req.query;
        if (!stateId) {
            return res.status(400).json({ success: false, error: 'stateId is required' });
        }
        const cities = await City_1.default.find({ stateId, isActive: true })
            .select('_id name slug stateId')
            .sort({ sortOrder: 1, name: 1 })
            .lean();
        res.json({ success: true, data: cities });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching cities' });
    }
};
exports.getCities = getCities;
/** List courses for consumer filter dropdown (active only). */
const getCourses = async (_req, res) => {
    try {
        const courses = await Course_1.default.find({ isActive: true })
            .select('_id name slug')
            .sort({ sortOrder: 1, name: 1 })
            .lean();
        res.json({ success: true, data: courses });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching courses' });
    }
};
exports.getCourses = getCourses;
//# sourceMappingURL=locationController.js.map