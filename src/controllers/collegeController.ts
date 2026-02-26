import { Request, Response } from 'express';
import College from '../models/College';

export const createCollege = async (req: Request, res: Response) => {
    try {
        const college = new College(req.body);
        await college.save();
        res.status(201).json(college);
    } catch (error) {
        res.status(500).json({ message: 'Error creating college', error });
    }
};

export const getColleges = async (req: Request, res: Response) => {
    try {
        const colleges = await College.find();
        res.json(colleges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching colleges', error });
    }
};

export const updateCollege = async (req: Request, res: Response) => {
    try {
        const college = await College.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(college);
    } catch (error) {
        res.status(500).json({ message: 'Error updating college', error });
    }
};

export const deleteCollege = async (req: Request, res: Response) => {
    try {
        await College.findByIdAndDelete(req.params.id);
        res.json({ message: 'College deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting college', error });
    }
};
