"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCity = exports.createCity = exports.listCities = void 0;
const City_1 = __importDefault(require("../models/City"));
const slugify_1 = require("../utils/slugify");
const listCities = async (req, res) => {
    try {
        const { stateId } = req.query;
        const filter = {};
        if (stateId)
            filter.stateId = stateId;
        const cities = await City_1.default.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
        res.json({ success: true, data: cities });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching cities' });
    }
};
exports.listCities = listCities;
const createCity = async (req, res) => {
    try {
        const { stateId, name, isActive, sortOrder } = req.body;
        if (!stateId || !name) {
            return res.status(400).json({ success: false, error: 'stateId and name are required' });
        }
        const slug = (0, slugify_1.slugify)(name);
        const existing = await City_1.default.findOne({ stateId, slug });
        if (existing) {
            return res.status(400).json({ success: false, error: 'City with this slug already exists in this state' });
        }
        const city = new City_1.default({ stateId, name, slug, isActive: isActive !== false, sortOrder });
        await city.save();
        res.status(201).json({ success: true, data: city });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error creating city' });
    }
};
exports.createCity = createCity;
const updateCity = async (req, res) => {
    try {
        const updates = { ...req.body };
        const city = await City_1.default.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!city) {
            return res.status(404).json({ success: false, error: 'City not found' });
        }
        res.json({ success: true, data: city });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error updating city' });
    }
};
exports.updateCity = updateCity;
//# sourceMappingURL=adminCityController.js.map