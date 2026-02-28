import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import collegeRoutes from './routes/collegeRoutes';
import enquiryRoutes from './routes/enquiryRoutes';
import locations from './routes/locations';
import counsellingEnquiryRoutes from './routes/counsellingEnquiry';
import collegeApplicationRoutes from './routes/collegeApplication';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import seedAdmin from './seed';
import dns from 'dns';

// Fix for SRV resolution issue in some Node versions/environments
dns.setDefaultResultOrder('ipv4first');
// Force Google DNS if local DNS fails to resolve SRV records
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    console.warn('Could not set custom DNS servers');
}

dotenv.config();

import adminRoutes from './routes/adminRoutes';
import adminApiRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/admin', adminRoutes); // Base path: /admin
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api', locations);
app.use('/api/counselling-enquiry', counsellingEnquiryRoutes);
app.use('/api/college-apply', collegeApplicationRoutes);
app.use('/api/admin', adminApiRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the API' });
});

// MongoDB Connection
const mongodbUri = process.env.MONGODB_URI || '';

console.log('Attempting to connect to MongoDB...');

mongoose
    .connect(mongodbUri)
    .then(async () => {
        console.log('Successfully connected to MongoDB Atlas');
        await seedAdmin();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Detailed MongoDB connection error:', err);
        process.exit(1); // Exit if we can't connect
    });
