import { Request, Response } from 'express';
import Enquiry from '../models/Enquiry';

export const createEnquiry = async (req: Request, res: Response) => {
    try {
        const enquiry = new Enquiry(req.body);
        await enquiry.save();
        res.status(201).json(enquiry);
    } catch (error) {
        res.status(500).json({ message: 'Error creating enquiry', error });
    }
};

export const getEnquiries = async (req: Request, res: Response) => {
    try {
        const enquiries = await Enquiry.find().populate('collegeId', 'name');
        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching enquiries', error });
    }
};

export const updateEnquiryStatus = async (req: Request, res: Response) => {
    try {
        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(enquiry);
    } catch (error) {
        res.status(500).json({ message: 'Error updating enquiry', error });
    }
};
