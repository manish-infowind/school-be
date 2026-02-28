import { Request, Response } from 'express';
import City from '../models/City';
import { slugify } from '../utils/slugify';

export const listCities = async (req: Request, res: Response) => {
    try {
        const { stateId } = req.query;
        const filter: Record<string, unknown> = {};
        if (stateId) filter.stateId = stateId;
        const cities = await City.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
        res.json({ success: true, data: cities });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching cities' });
    }
};

export const createCity = async (req: Request, res: Response) => {
    try {
        const { stateId, name, isActive, sortOrder } = req.body;
        if (!stateId || !name) {
            return res.status(400).json({ success: false, error: 'stateId and name are required' });
        }
        const slug = slugify(name);
        const existing = await City.findOne({ stateId, slug });
        if (existing) {
            return res.status(400).json({ success: false, error: 'City with this slug already exists in this state' });
        }
        const city = new City({ stateId, name, slug, isActive: isActive !== false, sortOrder });
        await city.save();
        res.status(201).json({ success: true, data: city });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error creating city' });
    }
};

export const updateCity = async (req: Request, res: Response) => {
    try {
        const updates = { ...req.body };
        const city = await City.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!city) {
            return res.status(404).json({ success: false, error: 'City not found' });
        }
        res.json({ success: true, data: city });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error updating city' });
    }
};
