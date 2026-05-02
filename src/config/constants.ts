import { configDotenv } from "dotenv";

configDotenv();

export const PORT: string = process.env.PORT as string;
export const ES_URL: string = process.env.ES_URL as string;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const SLACK_WEBHOOK_URL: string = process.env
  .SLACK_WEBHOOK_URL as string;
export const WEBHOOK_URL: string = process.env.WEBHOOK_URL as string;
