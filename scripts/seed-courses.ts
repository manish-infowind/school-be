/**
 * Seed initial courses (B.Tech, MBA, BBA, etc.) for consumer filter dropdown.
 * Usage: npm run seed:courses  OR  npx ts-node scripts/seed-courses.ts
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../src/models/Course';
import { slugify, ensureUniqueSlug } from '../src/utils/slugify';

dotenv.config();

const DEFAULT_COURSES = [
    'B.Tech',
    'M.Tech',
    'B.E.',
    'M.E.',
    'MBA',
    'BBA',
    'B.Com',
    'M.Com',
    'BCA',
    'MCA',
    'MBBS',
    'BDS',
    'B.Pharm',
    'M.Pharm',
    'B.Arch',
    'B.Des',
    'LLB',
    'LLM',
    'B.Sc',
    'M.Sc',
    'B.A.',
    'M.A.',
    'B.Ed',
    'M.Ed',
    'PhD',
];

async function seedCourses() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI not set in .env');
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (let i = 0; i < DEFAULT_COURSES.length; i++) {
        const name = DEFAULT_COURSES[i];
        const baseSlug = slugify(name);
        const slug = await ensureUniqueSlug(
            (s) => Course.findOne({ slug: s }).then((doc) => doc),
            baseSlug
        );
        const existing = await Course.findOne({ slug });
        if (existing) {
            skipped++;
            continue;
        }
        await Course.create({
            name,
            slug,
            isActive: true,
            sortOrder: i + 1,
        });
        created++;
        console.log(`  + ${name} (${slug})`);
    }

    console.log(`\n✅ Courses seed done: ${created} created, ${skipped} already existed.`);
    await mongoose.disconnect();
    process.exit(0);
}

seedCourses().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
