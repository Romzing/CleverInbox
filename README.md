# CleverInbox – Real-Time Email Monitoring System

CleverInbox is a Node.js service for synchronizing and monitoring email accounts via IMAP, with support for Elasticsearch indexing and Slack/OpenAI integrations.

## Features
- Sync emails from the last 30 days for a given account
- Start and stop IMAP IDLE connections for real-time email monitoring
- Index emails into Elasticsearch
- Integrate with Slack and OpenAI (if configured)

## Requirements
- Node.js (v18+ recommended)
- pnpm or npm
- Docker (for Elasticsearch and Kibana)

## Setup

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd CleverInbox
   ```

2. **Install dependencies:**
   ```sh
   pnpm install
   # or
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   ES_URL=http://localhost:9200
   GEMINI_API_KEY=your_gemini_api_key
   SLACK_WEBHOOK_URL=your_slack_webhook_url
   WEBHOOK_URL=your_webhook_url
   ```
   Only `PORT` and `ES_URL` are strictly required for core functionality.

4. **(Optional) Start Elasticsearch and Kibana with Docker:**
   ```sh
   docker-compose up -d
   ```
   This will start Elasticsearch on port 9200 and Kibana on port 5601.

5. **Start the server:**
   ```sh
   pnpm dev
   # or
   npm run dev
   ```
   The server will run on `http://localhost:<PORT>`.

## API Endpoints

### 1. Sync Emails
**POST** `/sync`

Start syncing emails from the last 30 days for a given account.

**Request Body:**
```json
{
  "id": "unique-account-id",
  "host": "imap.example.com",
  "port": 993,
  "secure": true,
  "auth": {
    "user": "user@example.com",
    "pass": "password"
  }
}
```

**Response:**
```json
{ "message": "sync process started for the last 30 days." }
```

### 2. Start IMAP IDLE
**POST** `/idle/start`

Start an IMAP IDLE connection for real-time monitoring.

**Request Body:**
```json
{
  "id": "unique-account-id",
  "host": "imap.example.com",
  "port": 993,
  "secure": true,
  "auth": {
    "user": "user@example.com",
    "pass": "password"
  }
}
```

**Response:**
```json
{ "message": "idle service started successfully.", "connectionId": "..." }
```

### 3. Stop IMAP IDLE
**POST** `/idle/stop`

Stop an active IMAP IDLE connection.

**Request Body:**
```json
{
  "connectionId": "..." // The connection ID returned from /idle/start
}
```

**Response:**
```json
{ "message": "Idle connection <connectionId> stopped." }
```

## Environment Variables
| Variable            | Description                                 |
|---------------------|---------------------------------------------|
| PORT                | Port for the Express server                 |
| ES_URL              | Elasticsearch URL                           |
| OPENAI_API_KEY      | (Optional) OpenAI API key                   |
| SLACK_WEBHOOK_URL   | (Optional) Slack webhook URL                |
| WEBHOOK_URL         | (Optional) Webhook URL for notifications    |

## Development
- **Build:** `pnpm build` or `npm run build`
- **Start (prod):** `pnpm start` or `npm start`
- **Dev mode:** `pnpm dev` or `npm run dev`

## Dependencies
- [express](https://www.npmjs.com/package/express)
- [imapflow](https://www.npmjs.com/package/imapflow)
- [@elastic/elasticsearch](https://www.npmjs.com/package/@elastic/elasticsearch)
- [mailparser](https://www.npmjs.com/package/mailparser)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [@slack/webhook](https://www.npmjs.com/package/@slack/webhook)
- [langchain](https://www.npmjs.com/package/langchain)
- [axios](https://www.npmjs.com/package/axios)

## License
MIT