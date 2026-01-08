import 'dotenv/config'; // Load env vars immediately
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateContent, generateHash } from '../utils/contentGenerator.js';
import { Log } from '../models/Log.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTRIBUTORS_DIR = path.join(__dirname, '../../contributions');
const DAILY_LOG_FILE = path.join(__dirname, '../../DAILY_LOG.md');

async function run() {
    try {
        console.log("Starting daily contribution generation...");

        // Ensure DB connection
        if (!process.env.MONGO_URI) {
            console.warn("MONGO_URI not set. Running in offline/demo mode.");
        } else {
            console.log("Connecting to MongoDB...");
            await mongoose.connect(process.env.MONGO_URI);
            console.log("Connected.");
        }

        console.log("Generating content...");

        let recentLogs = [];
        if (mongoose.connection.readyState === 1) {
            recentLogs = await Log.find().sort({ date: -1 }).limit(30);
        }

        const content = await generateContent(recentLogs);
        const contentHash = generateHash(content);

        if (mongoose.connection.readyState === 1) {
            // Check for existing hash to be safe
            const exists = await Log.findOne({ hash: contentHash });
            if (!exists) {
                await Log.create({
                    date: new Date(),
                    type: content.type,
                    title: content.title,
                    hash: contentHash
                });
            } else {
                console.log("Duplicate content detected (hash match), skipping DB save but writing file for demo.");
            }
        }

        // 2. Write to filesystem
        // Ensure dir
        if (!fs.existsSync(CONTRIBUTORS_DIR)) {
            fs.mkdirSync(CONTRIBUTORS_DIR, { recursive: true });
        }

        const filename = `${new Date().toISOString().split('T')[0]}-contribution.json`;
        const filePath = path.join(CONTRIBUTORS_DIR, filename);

        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        console.log(`Wrote entry to ${filePath}`);

        // Update DAILY_LOG.md
        const logEntry = `\n## [${new Date().toISOString().split('T')[0]}] ${content.title}\n${content.content.summary}\n`;
        fs.appendFileSync(DAILY_LOG_FILE, logEntry);
        console.log("Updated DAILY_LOG.md");

        process.exit(0);

    } catch (error) {
        console.error("Error executing daily contribution:", error);
        if (error.cause) console.error("Cause:", error.cause);
        process.exit(1);
    }
}

run();
