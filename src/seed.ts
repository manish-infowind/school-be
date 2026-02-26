import User from './models/User';

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@example.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const admin = new User({
                name: 'System Admin',
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

export default seedAdmin;
