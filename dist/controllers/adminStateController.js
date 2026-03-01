"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateState = exports.createState = exports.listStates = void 0;
const State_1 = __importDefault(require("../models/State"));
const slugify_1 = require("../utils/slugify");
const listStates = async (req, res) => {
    try {
        const { countryId } = req.query;
        const filter = {};
        if (countryId)
            filter.countryId = countryId;
        const states = await State_1.default.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
        res.json({ success: true, data: states });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching states' });
    }
};
exports.listStates = listStates;
const createState = async (req, res) => {
    try {
        const { countryId, name, isActive, sortOrder } = req.body;
        if (!countryId || !name) {
            return res.status(400).json({ success: false, error: 'countryId and name are required' });
        }
        const slug = (0, slugify_1.slugify)(name);
        const existing = await State_1.default.findOne({ slug });
        if (existing) {
            return res.status(400).json({ success: false, error: 'State with this slug already exists' });
        }
        const state = new State_1.default({ countryId, name, slug, isActive: isActive !== false, sortOrder });
        await state.save();
        res.status(201).json({ success: true, data: state });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error creating state' });
    }
};
exports.createState = createState;
const updateState = async (req, res) => {
    try {
        const updates = { ...req.body };
        delete updates.slug;
        const state = await State_1.default.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!state) {
            return res.status(404).json({ success: false, error: 'State not found' });
        }
        res.json({ success: true, data: state });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error updating state' });
    }
};
exports.updateState = updateState;
//# sourceMappingURL=adminStateController.js.map