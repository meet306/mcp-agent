# MCP Daily Contribution Automator

This project implements a Model Context Protocol (MCP) server that automates daily GitHub contributions by generating legitimate, structured learning logs and code snippets.

## Features
- **MCP Server**: Exposes `generateDailyContribution` tool.
- **Genuine Content**: Generates varied topics (Node.js, streams, security, etc.) to ensure contributions are meaningful.
- **Deduplication**: Uses MongoDB to track history and ensure unique daily content.
- **Automation**: Runs daily via GitHub Actions.

## Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas (Free Tier) Account

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd <repo-name>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/daily-bot?retryWrites=true&w=majority
   ```

## Running Locally

### Start MCP Server
```bash
node src/mcp/server.js
```
This runs the SSE server on port 3000.

### Manual Contribution Trigger
```bash
node src/scripts/execute-daily.js
```
This script:
1. Connects to MongoDB.
2. Generates new unique content.
3. Writes a JSON file to `contributions/`.
4. Appends to `DAILY_LOG.md`.

## GitHub Actions Configuration
1. Go to **Settings > Secrets and variables > Actions**.
2. Add a New Repository Secret:
   - Name: `MONGO_URI`
   - Value: Your MongoDB Connection String.
3. The workflow is scheduled to run daily at midnight.

## Project Structure
```
├── .github/workflows/   # CI/CD Configuration
├── contributions/       # JSON storage of daily logs
├── src/
│   ├── mcp/            # MCP Server Logic
│   ├── models/         # Mongoose Schemas
│   ├── scripts/        # Automation Scripts
│   └── utils/          # Content Generators
├── DAILY_LOG.md        # Human-readable log
└── package.json
```


## Troubleshooting

### Deployment Issues
- **Action Fails on "Connect to MongoDB"**: Ensure your `MONGO_URI` secret is set correctly in GitHub repo settings.
- **"Duplicate content detected"**: The bot prevents duplicate topics. If you run it manually multiple times a day, this is expected behavior.
- **Git Push Permission Denied**: Check that the workflow has `contents: write` permission or use a PAT if specifically configured.

### Local Development
- If `npm install` fails, ensure you are on Node v18+.
- If `node src/scripts/execute-daily.js` errors, check that `.env` exists or the script will run in 'offline mode' (no database).

## Disclaimer
This tool is for educational purposes to demonstrate automation and MCP capabilities.
