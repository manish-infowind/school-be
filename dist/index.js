"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const collegeRoutes_1 = __importDefault(require("./routes/collegeRoutes"));
const enquiryRoutes_1 = __importDefault(require("./routes/enquiryRoutes"));
const locations_1 = __importDefault(require("./routes/locations"));
const counsellingEnquiry_1 = __importDefault(require("./routes/counsellingEnquiry"));
const collegeApplication_1 = __importDefault(require("./routes/collegeApplication"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const streamRoutes_1 = __importDefault(require("./routes/streamRoutes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const seed_1 = __importDefault(require("./seed"));
const dns_1 = __importDefault(require("dns"));
// Fix for SRV resolution issue in some Node versions/environments
dns_1.default.setDefaultResultOrder('ipv4first');
// Force Google DNS if local DNS fails to resolve SRV records
try {
    dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
}
catch (e) {
    console.warn('Could not set custom DNS servers');
}
dotenv_1.default.config();
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/admin', adminRoutes_1.default); // Base path: /admin
app.use('/api/users', userRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/colleges', collegeRoutes_1.default);
app.use('/api/enquiries', enquiryRoutes_1.default);
app.use('/api', locations_1.default);
app.use('/api/counselling-enquiry', counsellingEnquiry_1.default);
app.use('/api/college-apply', collegeApplication_1.default);
app.use('/api/events', eventRoutes_1.default);
app.use('/api/streams', streamRoutes_1.default);
app.use('/api/admin', admin_1.default);
// Swagger Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});
// MongoDB Connection
const mongodbUri = process.env.MONGODB_URI || '';
console.log('Attempting to connect to MongoDB...');
mongoose_1.default
    .connect(mongodbUri)
    .then(async () => {
    console.log('Successfully connected to MongoDB Atlas');
    await (0, seed_1.default)();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('Detailed MongoDB connection error:', err);
    process.exit(1); // Exit if we can't connect
});
//# sourceMappingURL=index.js.map