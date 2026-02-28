/**
 * Seed Indian states and cities from Indian-Cities-JSON.
 * Usage: npx ts-node scripts/seed-india-locations.ts [path/to/cities.json]
 * If no path given, fetches from GitHub raw URL.
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

function slugify(text: string): string {
    if (!text || typeof text !== 'string') return '';
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

interface CityJson {
    name: string;
    state: string;
    id?: string;
}

async function fetchJson(url: string): Promise<CityJson[]> {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    if (!MONGODB_URI) {
        console.error('Set MONGODB_URI in .env');
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    if (!db) {
        console.error('No db');
        process.exit(1);
    }

    const countryCol = db.collection('countries');
    const stateCol = db.collection('states');
    const cityCol = db.collection('cities');

    let indiaId = (await countryCol.findOne({ code: 'IN' }))?._id;
    if (!indiaId) {
        const inserted = await countryCol.insertOne({
            name: 'India',
            code: 'IN',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        indiaId = inserted.insertedId;
        console.log('Created country India');
    } else {
        console.log('Country India already exists');
    }

    let citiesJson: CityJson[];
    const filePath = process.argv[2];
    if (filePath) {
        const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
        const raw = fs.readFileSync(absPath, 'utf-8');
        citiesJson = JSON.parse(raw);
        console.log('Loaded', citiesJson.length, 'cities from file');
    } else {
        const url = 'https://raw.githubusercontent.com/nshntarora/Indian-Cities-JSON/master/cities.json';
        console.log('Fetching cities from', url);
        citiesJson = await fetchJson(url);
        console.log('Fetched', citiesJson.length, 'cities');
    }

    const stateNames = [...new Set(citiesJson.map((c) => c.state).filter(Boolean))].sort();
    const stateSlugToId: Record<string, mongoose.Types.ObjectId> = {};

    for (const stateName of stateNames) {
        const slug = slugify(stateName);
        if (!slug) continue;
        const existing = await stateCol.findOne({ slug });
        if (existing) {
            stateSlugToId[slug] = existing._id as mongoose.Types.ObjectId;
            continue;
        }
        const inserted = await stateCol.insertOne({
            countryId: indiaId,
            name: stateName,
            slug,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        stateSlugToId[slug] = inserted.insertedId as mongoose.Types.ObjectId;
        console.log('State:', stateName, '->', slug);
    }

    let inserted = 0;
    let skipped = 0;
    for (const c of citiesJson) {
        if (!c.state || !c.name) continue;
        const stateSlug = slugify(c.state);
        const stateId = stateSlugToId[stateSlug];
        if (!stateId) continue;
        const citySlug = slugify(c.name);
        if (!citySlug) continue;
        const exists = await cityCol.findOne({ stateId, slug: citySlug });
        if (exists) {
            skipped++;
            continue;
        }
        await cityCol.insertOne({
            stateId,
            name: c.name,
            slug: citySlug,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        inserted++;
    }

    console.log('Cities inserted:', inserted, 'skipped (duplicate slug):', skipped);
    await mongoose.disconnect();
    process.exit(0);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
