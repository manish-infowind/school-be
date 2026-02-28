import { Request, Response } from 'express';
import Country from '../models/Country';
import State from '../models/State';
import City from '../models/City';
import Course from '../models/Course';

export const getCountries = async (_req: Request, res: Response) => {
    try {
        const countries = await Country.find({ isActive: true })
            .select('_id name code')
            .sort({ name: 1 })
            .lean();
        res.json({ success: true, data: countries });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching countries' });
    }
};

export const getStates = async (req: Request, res: Response) => {
    try {
        const { countryId } = req.query;
        const filter: Record<string, unknown> = { isActive: true };
        if (countryId) filter.countryId = countryId;
        const states = await State.find(filter)
            .select('_id name slug')
            .sort({ sortOrder: 1, name: 1 })
            .lean();
        res.json({ success: true, data: states });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching states' });
    }
};

export const getCities = async (req: Request, res: Response) => {
    try {
        const { stateId } = req.query;
        if (!stateId) {
            return res.status(400).json({ success: false, error: 'stateId is required' });
        }
        const cities = await City.find({ stateId, isActive: true })
            .select('_id name slug stateId')
            .sort({ sortOrder: 1, name: 1 })
            .lean();
        res.json({ success: true, data: cities });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching cities' });
    }
};

/** List courses for consumer filter dropdown (active only). */
export const getCourses = async (_req: Request, res: Response) => {
    try {
        const courses = await Course.find({ isActive: true })
            .select('_id name slug')
            .sort({ sortOrder: 1, name: 1 })
            .lean();
        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching courses' });
    }
};
