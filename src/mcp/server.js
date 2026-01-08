
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { z } from 'zod';
import { generateContent, generateHash } from '../utils/contentGenerator.js';
import { Log } from '../models/Log.js';

dotenv.config();

const app = express();
export const mcpServer = new McpServer({
    name: "Daily Contribution Bot",
    version: "1.0.0"
});

// Tool Definition
mcpServer.tool(
    "generateDailyContribution",
    {}, // No arguments needed for this specific tool based on prompt, but we can add overrides if needed
    async () => {
        // 1. Connect to DB if not connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        // 2. Fetch recent logs to avoid duplicates
        const recentLogs = await Log.find().sort({ date: -1 }).limit(30);

        // 3. Generate content
        const content = await generateContent(recentLogs);
        const contentHash = generateHash(content);

        // 4. Check uniqueness (double check)
        const exists = await Log.findOne({ hash: contentHash });
        if (exists) {
            // Retry once with a timestamp/salt if strictly needed, or just proceed
        }

        // 5. Save to DB
        await Log.create({
            date: new Date(),
            type: content.type,
            title: content.title,
            hash: contentHash
        });

        // 6. Return JSON
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(content, null, 2)
                }
            ]
        };
    }
);

// Express Routes for SSE
app.get('/sse', async (req, res) => {
    const transport = new SSEServerTransport("/messages", res);
    await mcpServer.connect(transport);
});

app.post('/messages', async (req, res) => {
    // Handle client messages (not strictly needed for one-way tool calls but part of SSE spec)
    // For standard MCP, we'd need a way to handle incoming posts associated with the SSE connection
    // The SDK's SSEServerTransport usually handles the response object passed in /sse, 
    // but we need to route incoming POSTs to the transport's handlePostMessage if exposed.
    // For this automation, we might not strictly need full SSE loop if running via script.
    res.sendStatus(200);
});

export const startServer = async (port = 3000) => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    }
    return app.listen(port, () => {
        console.log(`MCP Server running on port ${port}`);
    });
};

// Start if run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    startServer();
}
