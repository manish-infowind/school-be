"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("./models/User"));
const Country_1 = __importDefault(require("./models/Country"));
const seedCountry = async () => {
    try {
        const existing = await Country_1.default.findOne({ code: 'IN' });
        if (!existing) {
            await Country_1.default.create({ name: 'India', code: 'IN', isActive: true });
            console.log('✅ Country India seeded');
        }
    }
    catch (error) {
        console.error('❌ Error seeding country:', error);
    }
};
const seedAdmin = async () => {
    try {
        const adminEmail = 'eduversitycollege@gmail.com';
        const existingAdmin = await User_1.default.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const admin = new User_1.default({
                firstName: 'Mahendra',
                lastName: 'Parmar',
                email: adminEmail,
                password: 'Mahendra@2026',
                phone: '9584807977',
                role: 'admin'
            });
            await admin.save();
            console.log('✅ Default admin user created successfully');
            console.log('📧 Email: admin@example.com');
            console.log('🔑 Password: adminrootuser');
        }
        else {
            console.log('ℹ️ Default admin user already exists');
        }
    }
    catch (error) {
        console.error('❌ Error seeding admin user:', error);
    }
};
const runSeed = async () => {
    await seedCountry();
    await seedAdmin();
};
exports.default = runSeed;
//# sourceMappingURL=seed.js.map