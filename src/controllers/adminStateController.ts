import { Request, Response } from 'express';
import State from '../models/State';
import { slugify } from '../utils/slugify';

export const listStates = async (req: Request, res: Response) => {
    try {
        const { countryId } = req.query;
        const filter: Record<string, unknown> = {};
        if (countryId) filter.countryId = countryId;
        const states = await State.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
        res.json({ success: true, data: states });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching states' });
    }
};

export const createState = async (req: Request, res: Response) => {
    try {
        const { countryId, name, isActive, sortOrder } = req.body;
        if (!countryId || !name) {
            return res.status(400).json({ success: false, error: 'countryId and name are required' });
        }
        const slug = slugify(name);
        const existing = await State.findOne({ slug });
        if (existing) {
            return res.status(400).json({ success: false, error: 'State with this slug already exists' });
        }
        const state = new State({ countryId, name, slug, isActive: isActive !== false, sortOrder });
        await state.save();
        res.status(201).json({ success: true, data: state });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error creating state' });
    }
};

export const updateState = async (req: Request, res: Response) => {
    try {
        const updates = { ...req.body };
        delete (updates as Record<string, unknown>).slug;
        const state = await State.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!state) {
            return res.status(404).json({ success: false, error: 'State not found' });
        }
        res.json({ success: true, data: state });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error updating state' });
    }
};
