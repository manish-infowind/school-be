import User from './models/User';
import Country from './models/Country';

const seedCountry = async () => {
    try {
        const existing = await Country.findOne({ code: 'IN' });
        if (!existing) {
            await Country.create({ name: 'India', code: 'IN', isActive: true });
            console.log('✅ Country India seeded');
        }
    } catch (error) {
        console.error('❌ Error seeding country:', error);
    }
};

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@example.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const admin = new User({
                firstName: 'System',
                lastName: 'Admin',
                email: adminEmail,
                password: 'adminrootuser',
                phone: '1234567890',
                role: 'admin'
            });

            await admin.save();
            console.log('✅ Default admin user created successfully');
            console.log('📧 Email: admin@example.com');
            console.log('🔑 Password: adminrootuser');
        } else {
            console.log('ℹ️ Default admin user already exists');
        }
    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
    }
};

const runSeed = async () => {
    await seedCountry();
    await seedAdmin();
};

export default runSeed;
